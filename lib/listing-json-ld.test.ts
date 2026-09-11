import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "@/lib/listing-json-ld";

describe("serializeJsonLd", () => {
  it("escapes < so a user-submitted </script> can't break out of the script tag", () => {
    const serialized = serializeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });

  it("still round-trips to the original value through JSON.parse", () => {
    const original = { name: "3-room flat </script> in Chilonzor" };

    expect(JSON.parse(serializeJsonLd(original))).toEqual(original);
  });
});
