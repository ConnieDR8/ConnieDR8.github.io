resource "google_storage_bucket" "tf_bucket" {
  name                        = "tf-bucket-902618"
  location                    = "US"
  force_destroy               = true
  uniform_bucket_level_access = true
  project                     = var.project_id
}
