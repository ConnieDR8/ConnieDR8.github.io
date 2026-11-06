resource "google_compute_instance" "tf_instance_1" {
  name         = "tf-instance-1"
  machine_type = "e2-standard-2"
  zone         = var.zone
  project      = var.project_id

  boot_disk {
    auto_delete = true

    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 10
    }
  }

  network_interface {
    network    = "tf-vpc-605465"
    subnetwork = "subnet-01"
  }

  metadata_startup_script = "#!/bin/bash\n"

  allow_stopping_for_update = true
}

resource "google_compute_instance" "tf_instance_2" {
  name         = "tf-instance-2"
  machine_type = "e2-standard-2"
  zone         = var.zone
  project      = var.project_id

  boot_disk {
    auto_delete = true

    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 10
    }
  }

  network_interface {
    network    = "tf-vpc-605465"
    subnetwork = "subnet-02"
  }

  metadata_startup_script = "#!/bin/bash\n"

  allow_stopping_for_update = true
}
