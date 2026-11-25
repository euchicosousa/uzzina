import { expect, it } from "bun:test";
import {
  expectedInstagramPublishFormat,
  instagramPublishMediaError,
} from "../app/lib/instagram-publish-media";

const image = "https://res.cloudinary.com/x/image/upload/a.jpg";
const video = "https://res.cloudinary.com/x/video/upload/a.mp4";

it("maps every schedulable category to its Instagram format", () => {
  expect(expectedInstagramPublishFormat("post", [image])).toBe("feed");
  expect(expectedInstagramPublishFormat("post", [video])).toBe("video");
  expect(expectedInstagramPublishFormat("post", [image, image])).toBeNull();
  expect(expectedInstagramPublishFormat("carousel", [image, video])).toBe(
    "feed",
  );
  expect(expectedInstagramPublishFormat("reels", [video])).toBe("reel");
  expect(expectedInstagramPublishFormat("stories", [image, video])).toBe(
    "stories",
  );
  expect(expectedInstagramPublishFormat("design", [image])).toBeNull();
});

it("applies the same media rules to scheduling as to publishing", () => {
  expect(instagramPublishMediaError("feed", [image, video])).toBeNull();
  expect(instagramPublishMediaError("reel", [video])).toBeNull();
  expect(instagramPublishMediaError("reel", [image])).not.toBeNull();
  expect(instagramPublishMediaError("stories", [image, video])).toBeNull();
});
