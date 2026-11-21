"use client";

import About from "./About";
import { usePublicProfile } from "@/context/PublicProfileContext";

export default function HomeAboutSection() {
  const { profile, loading } = usePublicProfile();

  const hasAbout = Boolean(
    profile.content.about.heading ||
      profile.personal_details.about_paragraphs.length ||
      Object.keys(profile.preferences.tech_stack).length
  );

  if (loading || !hasAbout) {
    return null;
  }

  return (
    <About
      personalDetails={profile.personal_details}
      preferences={profile.preferences}
      content={profile.content.about}
    />
  );
}
