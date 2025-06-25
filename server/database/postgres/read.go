package postgres

import (
	"context"
	"database/sql"

	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/shopspring/decimal"
)

func (p *Postgres) GetOauthUserIdByProviderID(ctx context.Context, pid string) (id uuid.UUID, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT id FROM luxora_user WHERE provider_user_id = $1", pid).Scan(&id)
	return
}

func (p *Postgres) GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin sql.NullTime, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT last_login FROM luxora_user WHERE id = $1", userID).Scan(&LastLogin)
	return
}

func (p *Postgres) GetRefreshToken(ctx context.Context, userId uuid.UUID) (refreshToken string, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT refresh_token FROM luxora_user WHERE id=$1", userId).Scan(&refreshToken)
	return
}

func (p *Postgres) GetIsUsernameAndIDByProviderID(ctx context.Context, providerID string) (username string, userID uuid.UUID, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT username, id FROM luxora_user WHERE provider_user_id=$1", providerID).Scan(&username, &userID)
	return
}

func (p *Postgres) GetHighestBid(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (bid *models.BidDetails, err error) {
	bid = &models.BidDetails{}
	err = p.Pool.QueryRow(ctx, "SELECT bid_id, bid_amount, bid_time, user_id, message FROM product_bid WHERE item_id=$1 ORDER BY bid_amount DESC LIMIT 1", productID).Scan(&bid.BidID, &bid.BidAmount, &bid.CreatedAt, &bid.CreatedBy, &bid.Message)
	if err != nil {
		return nil, err
	}

	bid.ProductID = productID
	return
}

func (p *Postgres) GetBids(ctx context.Context, userID uuid.UUID, productID uuid.UUID, limit, offset int) (bids []models.BidDetails, err error) {
	bids = make([]models.BidDetails, 0, limit)

	rows, err := p.Pool.Query(ctx, "SELECT bid_id, bid_amount, bid_time, user_id, message FROM product_bid WHERE item_id=$1 ORDER BY bid_amount DESC LIMIT $2 OFFSET $3", productID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var bid = models.BidDetails{}
		bid.ProductID = productID

		err := rows.Scan(&bid.BidID, &bid.BidAmount, &bid.CreatedAt, &bid.CreatedBy, &bid.Message)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}

	return
}

func craftGetQuery(createdBy uuid.UUID, category, searchQuery *string, startPrice, endPrice *decimal.Decimal, limit, offset int) (query string, params []any) {
	var builder = strings.Builder{}

	builder.WriteString(`
	WITH latest_prices AS (
		SELECT DISTINCT ON (product_id)
		  product_id,
		  price,
		  currency,
		  created
		FROM luxora_product_price_history
		ORDER BY product_id, created DESC
	  )
	SELECT 
		lp.item_id,
		lp.name,
		lp.user_id,
		lp.created_at,
		lp.description,
		lpp.price,
		lpp.currency
		FROM luxora_product lp
		JOIN latest_prices lpp ON lp.item_id = lpp.product_id
	`)

	var filters []string
	params = []any{}

	if category != nil {
		params = append(params, *category)
		filters = append(filters, fmt.Sprintf(" lp.category = $%d ", len(params)))
	}

	if startPrice != nil {
		params = append(params, *startPrice)
		filters = append(filters, fmt.Sprintf(" lpp.price >= $%d ", len(params)))
	}

	if endPrice != nil {
		params = append(params, *endPrice)
		filters = append(filters, fmt.Sprintf(" lpp.price < $%d ", len(params)))
	}

	if createdBy != uuid.Nil {
		params = append(params, createdBy)
		filters = append(filters, fmt.Sprintf(" lp.user_id = $%d ", len(params)))
	}

	if searchQuery != nil {
		filters = append(filters, fmt.Sprintf(" similarity(lp.name, '%v') > 0.01 ORDER BY similarity(lp.name, '%v') DESC ", *searchQuery, *searchQuery))
	}

	if len(filters) > 0 {
		builder.WriteString(" WHERE ")
		builder.WriteString(strings.Join(filters, " AND "))
	}

	if searchQuery == nil {
		builder.WriteString(" ORDER BY lp.created_at DESC ")
	}

	params = append(params, limit)
	builder.WriteString(fmt.Sprintf(" LIMIT $%d ", len(params)))

	params = append(params, offset)
	builder.WriteString(fmt.Sprintf(" OFFSET $%d ", len(params)))

	return builder.String(), params
}

func (p *Postgres) GetProducts(ctx context.Context, userID, createdBy uuid.UUID, category, searchQuery *string, startPrice, endPrice *decimal.Decimal, limit, offset int) (products []models.ProductInfo, err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}

	products = make([]models.ProductInfo, 0, limit)

	query, params := craftGetQuery(createdBy, category, searchQuery, startPrice, endPrice, limit, offset)

	rows, err := tx.Query(ctx, query, params...)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var product models.ProductInfo
		if category != nil {
			product.Category = *category
		}

		err = rows.Scan(&product.ItemID, &product.Name, &product.CreatedBy, &product.CreatedAt, &product.Description, &product.Price, &product.Currency)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}
	rows.Close()

	for i := range products {
		products[i].Images = []models.ProductImage{}

		rows, err := tx.Query(ctx, "SELECT compressed_image, sort_order FROM luxora_product_image WHERE product_id=$1 ORDER BY sort_order ASC", products[i].ItemID)
		if err != nil {
			continue
		}

		for rows.Next() {
			var image = models.ProductImage{}
			err = rows.Scan(&image.CompressedImage, &image.Order)
			if err != nil {
				continue
			}

			products[i].Images = append(products[i].Images, image)
		}
		rows.Close()
	}

	return products, nil
}

func (p *Postgres) GetUserDetails(ctx context.Context, userID uuid.UUID) (details models.UserDetails, err error) {
	details = models.UserDetails{}
	err = p.Pool.QueryRow(ctx, "SELECT email, username, profile_picture_link FROM luxora_user WHERE id=$1", userID).Scan(&details.Email, &details.Username, &details.ProfileImageLink)
	details.UserID = userID
	return
}

func (p *Postgres) GetProductById(ctx context.Context, productID uuid.UUID) (product models.ProductInfo, err error) {
	if productID == uuid.Nil {
		return product, fmt.Errorf("invalid productID")
	}

	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return product, err
	}

	defer func ()  {
		if err != nil {
			tx.Rollback(ctx)
		}else {
			tx.Commit(ctx)
		}
	}()

	query := `
		WITH latest_prices AS (
		SELECT DISTINCT ON (product_id)
		  product_id,
		  price,
		  currency,
		  created
		FROM luxora_product_price_history
		ORDER BY product_id, created DESC
	  )
	SELECT 
		lp.name,
		lp.user_id,
		lp.category,
		lp.created_at,
		lp.description,
		lpp.price,
		lpp.currency
		FROM luxora_product lp
		JOIN latest_prices lpp ON lp.item_id = lpp.product_id WHERE lp.item_id = $1
	`

	product = models.ProductInfo{}
	product.ItemID = productID
	productRow := tx.QueryRow(ctx, query, productID)

	err = productRow.Scan(&product.Name, &product.CreatedBy, &product.Category, &product.CreatedAt, &product.Description, &product.Price, &product.Currency)
	if err != nil {
		return product, err
	}

	product.Images = []models.ProductImage{}

	rows, err := tx.Query(ctx, "SELECT compressed_image, sort_order FROM luxora_product_image WHERE product_id=$1 ORDER BY sort_order ASC", product.ItemID)
	if err != nil {
		return product, err
	}

	for rows.Next() {
		var image = models.ProductImage{}
		err = rows.Scan(&image.CompressedImage, &image.Order)
		if err != nil {
			continue
		}

		product.Images = append(product.Images, image)
	}
	rows.Close()

	return product, nil
}

func (p *Postgres) GetUserBids(ctx context.Context, userID uuid.UUID, limit, offset int) (bids []models.BidDetails, err error) {
	bids = make([]models.BidDetails, 0, limit)

	query := `
		SELECT pb.bid_id, pb.bid_amount, pb.bid_time, pb.user_id, pb.message, pb.item_id, lp.name
		FROM product_bid pb
		JOIN luxora_product lp ON pb.item_id = lp.item_id
		WHERE pb.user_id = $1
		ORDER BY pb.bid_time DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := p.Pool.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var bid models.BidDetails
		var productName string
		
		err := rows.Scan(&bid.BidID, &bid.BidAmount, &bid.CreatedAt, &bid.CreatedBy, &bid.Message, &bid.ProductID, &productName)
		if err != nil {
			return nil, err
		}
		
		bids = append(bids, bid)
	}

	return bids, nil
}

func (p *Postgres) GetBidsOnUserListings(ctx context.Context, userID uuid.UUID) (bidsByProduct []models.BidsOnUserListing, err error) {
	query := `
		SELECT DISTINCT lp.item_id, lp.name
		FROM luxora_product lp
		JOIN product_bid pb ON lp.item_id = pb.item_id
		WHERE lp.user_id = $1 AND lp.sold = false
		ORDER BY lp.name
	`
	
	rows, err := p.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var productMap = make(map[uuid.UUID]models.BidsOnUserListing)
	var productIDs []uuid.UUID

	for rows.Next() {
		var productID uuid.UUID
		var productName string
		
		err := rows.Scan(&productID, &productName)
		if err != nil {
			return nil, err
		}
		
		productMap[productID] = models.BidsOnUserListing{
			ProductID:   productID,
			ProductName: productName,
			Bids:        []models.BidDetails{},
		}
		productIDs = append(productIDs, productID)
	}

	// Now get all bids for these products
	if len(productIDs) > 0 {
		bidsQuery := `
			SELECT pb.bid_id, pb.bid_amount, pb.bid_time, pb.user_id, pb.message, pb.item_id
			FROM product_bid pb
			WHERE pb.item_id = ANY($1)
			ORDER BY pb.item_id, pb.bid_amount DESC
		`
		
		bidsRows, err := p.Pool.Query(ctx, bidsQuery, productIDs)
		if err != nil {
			return nil, err
		}
		defer bidsRows.Close()

		for bidsRows.Next() {
			var bid models.BidDetails
			
			err := bidsRows.Scan(&bid.BidID, &bid.BidAmount, &bid.CreatedAt, &bid.CreatedBy, &bid.Message, &bid.ProductID)
			if err != nil {
				return nil, err
			}
			
			if listing, exists := productMap[bid.ProductID]; exists {
				listing.Bids = append(listing.Bids, bid)
				productMap[bid.ProductID] = listing
			}
		}
	}

	for _, listing := range productMap {
		bidsByProduct = append(bidsByProduct, listing)
	}

	return bidsByProduct, nil
}
