"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  PublicProfileApiResponse,
  PublicProfileData,
} from "@/lib/profile-types";

interface PublicProfileContextValue {
  profile: PublicProfileData;
  loading: boolean;
}

const emptyPublicProfileData: PublicProfileData = {
  personal_details: {
    name: "",
    title: "",
    location: "",
    bio: "",
    about_paragraphs: [],
    contact: {
      email: "",
      phone: "",
      address: "",
    },
    links: {
      website: "",
      github: "",
      linkedin: "",
    },
  },
  preferences: {
    available_for_opportunities: false,
    tech_stack: {},
  },
  content: {
    intro: {
      availability_available: "",
      availability_unavailable: "",
      headline: "",
      primary_cta_label: "",
      secondary_cta_label: "",
      highlights: [],
    },
    about: {
      eyebrow_label: "",
      heading: "",
      intro: "",
      based_in_label: "",
      skills_eyebrow_label: "",
      skills_heading: "",
      skills_intro: "",
    },
    contact: {
      eyebrow_label: "",
      heading: "",
      intro: "",
      banner_eyebrow_label: "",
      banner_heading: "",
      banner_intro: "",
      quick_links_label: "",
      email_action_label: "",
      linkedin_action_label: "",
      github_action_label: "",
      quick_links_note: "",
      details_eyebrow_label: "",
      details_heading: "",
      details_intro: "",
      profiles_label: "",
      form_eyebrow_label: "",
      form_heading: "",
      form_intro: "",
      submit_button_label: "",
      success_message: "",
    },
    product_focus: {
      eyebrow_label: "",
      heading: "",
      intro: "",
      principles_label: "",
      principles: [],
      closing_note: "",
    },
  },
};

const PublicProfileContext = createContext<PublicProfileContextValue>({
  profile: emptyPublicProfileData,
  loading: false,
});

export function PublicProfileProvider({
  children,
  initialProfile = emptyPublicProfileData,
}: {
  children: React.ReactNode;
  initialProfile?: PublicProfileData;
}) {
  const [profile, setProfile] = useState<PublicProfileData>(
    initialProfile
  );
  const [loading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const payload = (await response.json()) as PublicProfileApiResponse;

        if (isActive && payload.success) {
          setProfile(payload.data);
        }
      } catch {
        // Keep the server-provided or empty profile content if the request fails.
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <PublicProfileContext.Provider
      value={{
        profile,
        loading,
      }}
    >
      {children}
    </PublicProfileContext.Provider>
  );
}

export const usePublicProfile = () => useContext(PublicProfileContext);
