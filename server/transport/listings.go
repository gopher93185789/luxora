package transport

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

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

	productId, err := t.CoreStore.CreateNewListing(r.Context(), uid, product)
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
//	@Param			id				query		string				true	"Product ID"
//	@Param			Authorization	header		string				true	"Access token"
//	@Success		200				{string}	string				"Listing deleted successfully"
//	@Failure		404				{object}	errs.ErrorResponse	"Product ID not found"
//	@Failure		500				{object}	errs.ErrorResponse	"Internal server error"
//	@Router			/listings/ [DELETE]
func (t *TransportConfig) DeleteListing(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	pidstr := r.URL.Query().Get("id")
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
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "invalid 'page' URL parameter")
	}

	products, err := t.CoreStore.GetListings(r.Context(), uid, r.URL.Query().Get("category"), r.URL.Query().Get("searchquery"), r.URL.Query().Get("startprice"), r.URL.Query().Get("endprice"), r.URL.Query().Get("creator"), limit, page)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode products "+err.Error())
		return
	}
}
