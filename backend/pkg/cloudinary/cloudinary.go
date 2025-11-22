package cloudinary
import (
	"context"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func Init(cloudName, apiKey, apiSecret string) error {
	var err error
	cld, err = cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	return err
}

func UploadImage(ctx context.Context, file interface{}) (string, error) {
	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: "neurostudy",
	})
	if err != nil {
		return "", err
	}
	return resp.SecureURL, nil
}