api_addr = "http://127.0.0.1:8200/vault/"
cluster_addr = "https://127.0.0.1:8201"
cluster_name = "vault-cluster-1"
disable_mlock = true
ui = true

listener "tcp" {
	address = "0.0.0.0:8200"
	tls_disable = 1
}

storage "file" {
	path = "/vault/data"
}

telemetry {
  disable_hostname = true
  prometheus_retention_time = "24h"
}
