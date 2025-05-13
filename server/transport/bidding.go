package transport

import (
	"encoding/json"
	"net/http"

	errs "github.com/gopher93185789/luxora/server/pkg/error"
	"github.com/gopher93185789/luxora/server/pkg/middleware"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

// @Summary      Create a bid
// @Description  This endpoint allows users to create bids on product listings. The request body must contain the bid details in JSON format.
// @Tags         bidding
// @Accept       json
// @Produce      json
// @Param        bid  body      models.Bid                true  "Bid details"
// @Success      200  {object}  models.CreateBidResponse  "Bid created successfully with the bid ID"
// @Failure      400  {object}  errs.ErrorResponse        "Bad request - invalid input or missing fields"
// @Failure      422  {object}  errs.ErrorResponse        "Unprocessable entity - failed to decode JSON payload"
// @Failure      500  {object}  errs.ErrorResponse        "Internal server error"
// @Router       /listings/bid [POST]
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
