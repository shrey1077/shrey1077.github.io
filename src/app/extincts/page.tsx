/**
 * The Extincts Project — `/extincts`: the project in full (2026-10-15),
 * opened by the room's button on the home page. The room is the one the home
 * page drew until then (ExtinctsRoom) — its four sections and the reports'
 * reader — untouched.
 */

import type { Metadata } from "next";
import { pageMeta } from "@/constants/seo";
import { RoomPage } from "@/components/pages/RoomPage";
import { ExtinctsRoom } from "@/components/home/ExtinctsRoom";
import { navSectionById } from "@/constants/navigation";

export const metadata: Metadata = pageMeta({
  title: "The Extincts Project",
  description: "An ongoing personal series on what we've lost — research reports, stories, a script and characters, by Shrey Singh.",
  path: "/extincts/",
});

export default function ExtinctsPage() {
  return (
    <RoomPage
      side="creative"
      eyebrow="Creative · An ongoing series"
      title="The Extincts Project"
      description={navSectionById("the-extincts-project")?.description ?? ""}
    >
      <div className="h-[calc(100dvh-17rem)] min-h-[30rem]">
        <ExtinctsRoom />
      </div>
    </RoomPage>
  );
}
