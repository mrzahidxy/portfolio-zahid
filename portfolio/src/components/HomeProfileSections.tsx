"use client";

import DefaultLoader from "./common/DefaultLoader";
import Intro from "./Intro";
import { usePublicProfile } from "@/context/PublicProfileContext";

export default function HomeProfileSections() {
  const { profile, loading } = usePublicProfile();

  const hasIntro = Boolean(
    profile.personal_details.name ||
      profile.content.intro.headline ||
      profile.personal_details.bio
  );

  if (loading) {
    return (
      <section className="flex min-h-[52vh] items-center justify-center px-4 py-20 md:px-6 md:py-24 lg:px-8">
        <DefaultLoader />
      </section>
    );
  }

  return hasIntro ? (
    <Intro
      personalDetails={profile.personal_details}
      preferences={profile.preferences}
      content={profile.content.intro}
    />
  ) : null;
}
