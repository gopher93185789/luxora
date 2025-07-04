package transport

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/google/uuid"
	errs "github.com/gopher93185789/luxora/server/pkg/error"
	"github.com/gopher93185789/luxora/server/pkg/middleware"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

var ProductPool = sync.Pool{
	New: func() any {
		return &models.Product{}
	},
}

//	@Summary		Create new listing
//	@Description	This endpoint allows users to create new product listings.
//
// The request body must contain the product details in JSON format.
//
//	@Tags			listings
//	@Accept			json
//	@Produce		json
//	@Param			product			body		models.Product			true	"Product details"
//	@Param			Authorization	header		string					true	"Access token"
//	@Success		200				{object}	CreateListingResponse	"Create listing response containing the product ID"
//	@Failure		422				{object}	errs.ErrorResponse		"Unprocessable entity - invalid JSON payload"
//	@Failure		500				{object}	errs.ErrorResponse		"Internal server error"
//	@Router			/listings [POST]
func (t *TransportConfig) CreateNewListing(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	// Create a context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	var product = ProductPool.Get().(*models.Product)
	defer ProductPool.Put(product)
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		errs.ErrorWithJson(w, http.StatusUnprocessableEntity, "failed to decode json payload")
		return
	}

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	productId, err := t.CoreStore.CreateNewListing(ctx, uid, product)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to create new listing: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(CreateListingResponse{ProductID: productId}); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode product id: "+err.Error())
		return
	}
}

//	@Summary		Delete a listing
//	@Description	This endpoint allows users to delete product listings.
//
// The request must include the product ID as a query parameter.
//
//	@Tags			listings
//	@Accept			*/*
//	@Produce		*/*
//	@Param			id				path		string				true	"Product ID"
//	@Param			Authorization	header		string				true	"Access token"
//	@Success		200				{string}	string				"Listing deleted successfully"
//	@Failure		404				{object}	errs.ErrorResponse	"Product ID not found"
//	@Failure		500				{object}	errs.ErrorResponse	"Internal server error"
//	@Router			/listings/{id} [DELETE]
func (t *TransportConfig) DeleteListing(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	pidstr := r.PathValue("id")
	pid, err := uuid.Parse(pidstr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusNotFound, "could not find 'id' URL parameter")
		return
	}

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	if err := t.CoreStore.DeleteListing(r.Context(), uid, pid); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to delete listing: "+err.Error())
		return
	}
}

// @Summary		Update sold status via bid
// @Description	This endpoint updates the sold status of a product based on a successful bid. The request body must contain the bid details in JSON format.
// @Tags			listings
// @Accept			json
// @Produce		json
// @Param			bid				body		models.SellItemViaBid	true	"Details of the bid used to mark the item as sold"
// @Param			Authorization	header		string					true	"Access token"
// @Success		200				{string}	string					"Item marked as sold successfully"
// @Failure		422				{object}	errs.ErrorResponse		"Unprocessable entity - invalid JSON payload"
// @Failure		500				{object}	errs.ErrorResponse		"Internal server error"
// @Router			/listings/sold/bid [PUT]
func (t *TransportConfig) UpdateSoldViaBid(w http.ResponseWriter, r *http.Request) {
	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	var info models.SellItemViaBid
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		errs.ErrorWithJson(w, http.StatusUnprocessableEntity, "failed to decode json payload")
		return
	}

	err = t.CoreStore.SetItemsSoldViaBid(r.Context(), uid, &info)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to update sold on item: "+err.Error())
		return
	}
}

// @Summary		Get product listings
// @Description	Retrieves a paginated list of product listings for the authenticated user. Supports optional filtering by category and price range.
// @Tags			listings
// @Accept			json
// @Produce		json
// @Param			limit			query		int					true	"Number of listings per page"
// @Param			page			query		int					true	"Page number to retrieve"
// @Param			category		query		string				false	"Category to filter listings"
// @Param			startprice		query		string				false	"Minimum price filter"
// @Param			searchquery		query		string				false	"search query"
// @Param			endprice		query		string				false	"Maximum price filter"
// @Param			creator			query		string				false	"the person who created the listing"
// @Param			Authorization	header		string				true	"Access token"
// @Success		200				{array}		models.Product		"List of product listings"
// @Failure		400				{object}	errs.ErrorResponse	"Bad request - missing or invalid parameters"
// @Failure		500				{object}	errs.ErrorResponse	"Internal server error"
// @Router			/listings [GET]
func (t *TransportConfig) GetListings(w http.ResponseWriter, r *http.Request) {
	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	if limitStr == "" {
		errs.ErrorWithJson(w, http.StatusBadRequest, "missing 'limit' URL parameter")
		return
	}

	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		errs.ErrorWithJson(w, http.StatusBadRequest, "missing 'page' URL parameter")
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "invalid 'limit' URL parameter")
		return
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "invalid 'page' URL parameter")
		return
	}

	products, err := t.CoreStore.GetListings(r.Context(), uid, r.URL.Query().Get("category"), r.URL.Query().Get("searchquery"), r.URL.Query().Get("startprice"), r.URL.Query().Get("endprice"), r.URL.Query().Get("creator"), limit, page)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Type", "application/json")
	gz := gzip.NewWriter(w)
	defer gz.Close()

	body, err := json.Marshal(products)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode products "+err.Error())
		return
	}

	gz.Write(body)
}

// @Summary      Checkout cart
// @Description  Processes the checkout for the authenticated user's cart. The request body must contain the cart items in JSON format.
// @Tags         listings
// @Accept       json
// @Produce      json
// @Param        cartItems      body    models.CartItems     true  "Cart items to checkout"
// @Param        Authorization  header  string               true  "Access token"
// @Success      200            {string} string              "Checkout successful"
// @Failure      422            {object} errs.ErrorResponse  "Unprocessable entity - invalid JSON payload"
// @Failure      500            {object} errs.ErrorResponse  "Internal server error"
// @Router       /listings/checkout [POST]
func (t *TransportConfig) Checkout(w http.ResponseWriter, r *http.Request) {
	var products models.CartItems
	if err := json.NewDecoder(r.Body).Decode(&products); err != nil {
		errs.ErrorWithJson(w, http.StatusUnprocessableEntity, "failed to decode json payload")
		return
	}

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	err = t.CoreStore.Checkout(r.Context(), uid, &products)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, err.Error())
		return
	}
}

// @Summary      Update a product listing
// @Description  This endpoint allows users to update their product listings. The request body must contain the update details in JSON format.
// @Tags         listings
// @Accept       json
// @Produce      json
// @Param        product        body    models.UpdateProduct  true  "Product update details"
// @Param        Authorization  header  string               true  "Access token"
// @Success      200           {string} string              "Product updated successfully"
// @Failure      422           {object} errs.ErrorResponse  "Unprocessable entity - invalid JSON payload"
// @Failure      500           {object} errs.ErrorResponse  "Internal server error"
// @Router       /listings [PATCH]
func (t *TransportConfig) UpdateListing(w http.ResponseWriter, r *http.Request) {
	var info models.UpdateProduct
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		errs.ErrorWithJson(w, http.StatusUnprocessableEntity, "failed to decode json payload")
		return
	}

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	err = t.CoreStore.UpdateProduct(r.Context(), uid, &info)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, err.Error())
		return
	}
}

// GetListingsById retrieves product listings based on a given product ID.
//
// @Summary      Retrieve product listings by ID
// @Description  Fetches listing information associated with a specific product UUID.
// @Tags         listings
// @Produce      json
// @Param        id      path     string                true  "Product UUID"
// @Success      200     {array}  models.Product        "List of product listings"
// @Failure      400     {object} errs.ErrorResponse    "Bad request - invalid or missing product ID"
// @Failure      500     {object} errs.ErrorResponse    "Internal server error"
// @Router       /listings/{id} [get]
func (t *TransportConfig) GetListingsById(w http.ResponseWriter, r *http.Request) {
	pidStr := r.PathValue("id")
	pid, err := uuid.Parse(pidStr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "invalid product id")
		return
	}

	products, err := t.CoreStore.GetListingByid(r.Context(), pid)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Type", "application/json")
	gz := gzip.NewWriter(w)
	defer gz.Close()

	body, err := json.Marshal(products)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode products "+err.Error())
		return
	}

	gz.Write(body)
}
