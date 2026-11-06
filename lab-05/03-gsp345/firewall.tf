resource "google_compute_firewall" "tf_firewall" {
  name    = "tf-firewall"
  project = var.project_id
  network = module.vpc.network_name

  direction = "INGRESS"

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
}
