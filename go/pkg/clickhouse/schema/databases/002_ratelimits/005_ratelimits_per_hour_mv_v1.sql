CREATE MATERIALIZED VIEW IF NOT EXISTS ratelimits.ratelimits_per_hour_mv_v1
TO ratelimits.ratelimits_per_hour_v1
AS
SELECT
  workspace_id,
  namespace_id,
  identifier,
  countIf(passed > 0) as passed,
  count(*) as total,
  toStartOfHour(fromUnixTimestamp64Milli(time)) AS time
FROM ratelimits.raw_ratelimits_v1
GROUP BY
  workspace_id,
  namespace_id,
  identifier,
  time
;
