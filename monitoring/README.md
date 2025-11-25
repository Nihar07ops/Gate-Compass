# GATE COMPASS - Monitoring Setup

This directory contains configuration for monitoring GATE COMPASS using Prometheus, Grafana, and Alertmanager.

## Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Alertmanager**: Alert routing and notification
- **Node Exporter**: System metrics
- **PostgreSQL Exporter**: Database metrics
- **Redis Exporter**: Cache metrics

## Quick Start

### 1. Start Monitoring Stack

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Dashboards

- **Grafana**: http://localhost:3001
  - Default credentials: admin/admin (change on first login)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

### 3. Configure Alerting

Edit `alertmanager.yml` to configure notification channels:

```yaml
receivers:
  - name: 'critical'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-critical'
    email_configs:
      - to: 'alerts@yourdomain.com'
```

## Metrics Available

### Backend Metrics
- HTTP request rate and duration
- Error rates by endpoint
- Active connections
- Memory usage
- CPU usage

### Database Metrics
- Connection pool usage
- Query performance
- Database size
- Active queries
- Slow queries

### Redis Metrics
- Memory usage
- Hit/miss ratio
- Connected clients
- Commands per second

### System Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

## Alert Rules

Alert rules are defined in `alerts/` directory:

- `backend-alerts.yml`: Backend service alerts
- `database-alerts.yml`: Database and cache alerts

### Example Alerts

- **HighErrorRate**: Triggers when error rate > 5% for 5 minutes
- **HighResponseTime**: Triggers when 95th percentile > 2s
- **BackendDown**: Triggers when backend is unreachable
- **DatabasePoolExhaustion**: Triggers when connection pool is nearly full
- **PostgreSQLDown**: Triggers when database is unreachable
- **RedisDown**: Triggers when Redis is unreachable

## Creating Custom Dashboards

### Import Pre-built Dashboards

1. Open Grafana (http://localhost:3001)
2. Go to Dashboards → Import
3. Use dashboard IDs:
   - Node Exporter: 1860
   - PostgreSQL: 9628
   - Redis: 11835

### Create Custom Dashboard

1. Click "+" → Dashboard
2. Add Panel
3. Select Prometheus as data source
4. Write PromQL query
5. Configure visualization

### Example Queries

**Request rate**:
```promql
rate(http_requests_total[5m])
```

**Error rate**:
```promql
rate(http_requests_total{status=~"5.."}[5m])
```

**Response time (95th percentile)**:
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Database connections**:
```promql
pg_stat_database_numbackends
```

**Redis memory usage**:
```promql
redis_memory_used_bytes / redis_memory_max_bytes
```

## Troubleshooting

### Prometheus not scraping targets

Check Prometheus targets:
```bash
curl http://localhost:9090/api/v1/targets
```

Verify services are exposing metrics:
```bash
curl http://backend:5000/metrics
```

### Grafana can't connect to Prometheus

1. Check Prometheus is running:
```bash
docker-compose -f docker-compose.monitoring.yml ps prometheus
```

2. Verify network connectivity:
```bash
docker-compose -f docker-compose.monitoring.yml exec grafana ping prometheus
```

### Alerts not firing

1. Check alert rules are loaded:
```bash
curl http://localhost:9090/api/v1/rules
```

2. Check Alertmanager configuration:
```bash
curl http://localhost:9093/api/v1/status
```

3. View Alertmanager logs:
```bash
docker-compose -f docker-compose.monitoring.yml logs alertmanager
```

## Best Practices

1. **Set appropriate alert thresholds** based on your baseline metrics
2. **Use alert grouping** to avoid alert fatigue
3. **Configure multiple notification channels** for critical alerts
4. **Regularly review and update dashboards**
5. **Set up alert inhibition** to prevent duplicate notifications
6. **Monitor the monitoring stack** itself
7. **Keep retention policies** appropriate for your needs

## Retention and Storage

### Prometheus Retention

Default retention is 15 days. To change:

```yaml
command:
  - '--storage.tsdb.retention.time=30d'
```

### Grafana Backup

Backup Grafana data:
```bash
docker-compose -f docker-compose.monitoring.yml exec grafana \
  tar czf /tmp/grafana-backup.tar.gz /var/lib/grafana
docker cp gate-compass-grafana:/tmp/grafana-backup.tar.gz ./
```

## Production Considerations

1. **Use persistent volumes** for data storage
2. **Configure authentication** for all services
3. **Use HTTPS** for external access
4. **Set up log rotation** for container logs
5. **Monitor disk space** for metrics storage
6. **Configure backup** for Prometheus and Grafana data
7. **Use service discovery** for dynamic environments
8. **Implement access control** for sensitive metrics

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
