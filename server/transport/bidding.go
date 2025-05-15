package transport

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	errs "github.com/gopher93185789/luxora/server/pkg/error"
	"github.com/gopher93185789/luxora/server/pkg/middleware"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

//	@Summary		Create a bid
//	@Description	This endpoint allows users to create bids on product listings. The request body must contain the bid details in JSON format.
//	@Tags			bidding
//	@Accept			json
//	@Produce		json
//	@Param			bid				body		models.Bid					true	"Bid details"
//	@Param			Authorization	header		string						true	"Access token"
//	@Success		200				{object}	models.CreateBidResponse	"Bid created successfully with the bid ID"
//	@Failure		400				{object}	errs.ErrorResponse			"Bad request - invalid input or missing fields"
//	@Failure		422				{object}	errs.ErrorResponse			"Unprocessable entity - failed to decode JSON payload"
//	@Failure		500				{object}	errs.ErrorResponse			"Internal server error"
//	@Router			/listings/bid [POST]
func (t *TransportConfig) CreateBid(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var bid models.Bid
	if err := json.NewDecoder(r.Body).Decode(&bid); err != nil {
		errs.ErrorWithJson(w, http.StatusUnprocessableEntity, "failed to decode json payload")
		return
	}

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	bidID, err := t.CoreStore.CreateBid(r.Context(), uid, &bid)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "failed to create bid: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(models.CreateBidResponse{BidID: bidID}); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode product id: "+err.Error())
		return
	}
}

//	@Summary		Get highest bid
//	@Description	This endpoint retrieves the highest bid for a specific product listing. The product ID must be provided as a query parameter.
//	@Tags			bidding
//	@Accept			*/*
//	@Produce		json
//	@Param			productid		query		string				true	"Product ID"
//	@Param			Authorization	header		string				true	"Access token"
//	@Success		200				{object}	models.Bid			"Highest bid details"
//	@Failure		400				{object}	errs.ErrorResponse	"Bad request - invalid or missing product ID"
//	@Failure		404				{object}	errs.ErrorResponse	"Not found - product ID not provided"
//	@Failure		500				{object}	errs.ErrorResponse	"Internal server error"
//	@Router			/listings/highest-bid [GET]
func (t *TransportConfig) GetHighestBid(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	productIdStr := r.URL.Query().Get("productid")
	if productIdStr == "" {
		errs.ErrorWithJson(w, http.StatusNotFound, "missing 'productid' URL parameter")
		return
	}

	productId, err := uuid.Parse(productIdStr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "invalid 'productid' URL parameter")
		return
	}

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	bid, err := t.CoreStore.GetHighestBid(r.Context(), uid, productId)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "failed to get highest bid: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(bid); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode product id: "+err.Error())
		return
	}
}

//	@Summary		Get bids for a product listing
//	@Description	Retrieves a paginated list of bids for a specific product listing. The product ID, limit, and page number must be provided as query parameters.
//	@Tags			bidding
//	@Accept			*/*
//	@Produce		json
//	@Param			productid		query		string				true	"The unique identifier of the product listing"
//	@Param			limit			query		int					true	"The maximum number of bids to retrieve per page"
//	@Param			page			query		int					true	"The page number to retrieve"
//	@Param			Authorization	header		string				true	"Access token"
//	@Success		200				{array}		models.Bid			"A list of bids for the specified product listing"
//	@Failure		400				{object}	errs.ErrorResponse	"Bad request - invalid or missing query parameters"
//	@Failure		404				{object}	errs.ErrorResponse	"Not found - product ID not provided"
//	@Failure		500				{object}	errs.ErrorResponse	"Internal server error"
//	@Router			/listings/bids [GET]
func (t *TransportConfig) GetBids(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	productIdStr := r.URL.Query().Get("productid")
	if productIdStr == "" {
		errs.ErrorWithJson(w, http.StatusNotFound, "missing 'productid' URL parameter")
		return
	}

	productId, err := uuid.Parse(productIdStr)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusNotFound, "invalid 'productid' URL parameter")
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

	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	bids, err := t.CoreStore.GetBids(r.Context(), uid, productId, limit, page)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "failed to get highest bid: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(bids); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode bids: "+err.Error())
		return
	}
}
