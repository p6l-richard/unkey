// Code generated by go generate; DO NOT EDIT.
package ratelimit_nodes3_limit5_duration60000_load2_00_windows10

import (
	"testing"

	"github.com/unkeyed/unkey/go/apps/api/integration"
	run "github.com/unkeyed/unkey/go/apps/api/integration/multi_node_ratelimiting"
	"github.com/unkeyed/unkey/go/pkg/testutil"
)

func TestIntegration_RateLimit_Nodes3_Limit5_Duration60000_Load2_00_Windows10(t *testing.T) {
	testutil.SkipUnlessIntegration(t)

	h := integration.New(t, integration.Config{
		NumNodes: 3,
	})

	run.RunRateLimitTest(
		t,
		h,
		5,     // limit
		60000, // duration
		10,    // window count
		2,     // load factor
		3,     // node count
	)
}
