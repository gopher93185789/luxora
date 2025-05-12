package transport

import (
	"encoding/json"
	"net/http"
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

// @Summary      Create new listing
// @Description  This endpoint allows users to create new product listings.
//
//	The request body must contain the product details in JSON format.
//
// @Tags         listings
// @Accept       json
// @Produce      json
// @Param        product  body      models.Product       true  "Product details"
// @Success      200      {object}  CreateListingResponse  "Create listing response containing the product ID"
// @Failure      422      {object}  errs.ErrorResponse     "Unprocessable entity - invalid JSON payload"
// @Failure      500      {object}  errs.ErrorResponse     "Internal server error"
// @Router       /listings/ [POST]
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

// @Summary      Delete a listing
// @Description  This endpoint allows users to delete product listings.
//
//	The request must include the product ID as a query parameter.
//
// @Tags         listings
// @Accept       */*
// @Produce      */*
// @Param        id  query      string      true  "Product ID"
// @Success      200  {string}  string      "Listing deleted successfully"
// @Failure      404  {object}  errs.ErrorResponse  "Product ID not found"
// @Failure      500  {object}  errs.ErrorResponse  "Internal server error"
// @Router       /listings/ [DELETE]
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
