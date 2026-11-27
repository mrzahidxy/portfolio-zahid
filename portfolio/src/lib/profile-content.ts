import bundledProfile from "@/data/profile.json";
import { revalidateTag, unstable_cache } from "next/cache";
import dbConnect, { dbConnectForPublicRead } from "@/lib/dbConnect";
import { createLogger } from "@/lib/logger";
import PortfolioContent from "@/models/PortfolioContent";
import type { AdminProfilePayload } from "./profile-admin";
import {
  defaultPublicProfileData,
  type FeaturedProject,
  type ProfileContent,
  type ProfileExperience,
  type PublicProfileData,
} from "./profile-types";
import type { Project } from "./project-types";
import type { AdminExperiencePayload } from "./experience-admin";

const PORTFOLIO_CONTENT_KEY = "primary";
const PUBLIC_PROFILE_CACHE_TAG = "public-profile";
const log = createLogger({ context: "lib/profile-content" });

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getExperienceId = (experience: ProfileExperience, index: number) =>
  experience.id ||
  `${toSlug(experience.role || "experience")}-${toSlug(experience.company || "item")}-${index + 1}`;

const normalizeExperiences = (
  experiences: ProfileExperience[]
): ProfileExperience[] =>
  experiences.map((experience, index) => ({
    ...experience,
    id: getExperienceId(experience, index),
  }));

const normalizeProfileContent = (profile: ProfileContent): ProfileContent => ({
  ...profile,
  history: {
    ...profile.history,
    experiences: normalizeExperiences(profile.history.experiences ?? []),
  },
});

const getPeriodStart = (period: string) =>
  period.split(/\s+(?:-|[\u2013\u2014])\s+/)[0]?.trim() ?? "";

const toPreviousExperience = (
  experience: ProfileExperience,
  nextCurrentPeriod: string
): ProfileExperience => {
  if (!experience.period.includes("Present")) {
    return experience;
  }

  const nextStart = getPeriodStart(nextCurrentPeriod);

  if (!nextStart) {
    return experience;
  }

  return {
    ...experience,
    period: experience.period.replace(/Present/i, nextStart),
  };
};

const toFallbackProject = (project: FeaturedProject, index: number): Project => {
  const slug = toSlug(project.title || `project-${index + 1}`);

  return {
    _id: `profile-${slug || index + 1}`,
    slug,
    title: project.title,
    description: project.description,
    displayOrder: index * 10,
    technology: project.technologies ?? [],
    githubLink: project.links.github,
    liveLink: project.links.live,
    isArchived: false,
  };
};

async function readDefaultProfile(): Promise<ProfileContent> {
  return normalizeProfileContent(bundledProfile as ProfileContent);
}

export async function readStaticProfileContent(): Promise<ProfileContent> {
  return readDefaultProfile();
}

export async function readStaticPublicProfileContent(): Promise<PublicProfileData> {
  return pickPublicProfileContent(await readDefaultProfile());
}

type PortfolioContentRecord = Partial<ProfileContent> & {
  key: string;
  content?: Partial<ProfileContent["content"]>;
};

const mergeProfileRecordWithFile = (
  fileProfile: ProfileContent,
  record: PortfolioContentRecord
): ProfileContent =>
  normalizeProfileContent({
    personal_details: record.personal_details
      ? {
          ...fileProfile.personal_details,
          ...record.personal_details,
          links: {
            ...fileProfile.personal_details.links,
            ...(record.personal_details.links ?? {}),
          },
        }
      : fileProfile.personal_details,
    preferences: record.preferences ?? fileProfile.preferences,
    history: record.history ?? fileProfile.history,
    metadata: record.metadata ?? fileProfile.metadata,
    content: {
      intro: {
        ...fileProfile.content.intro,
        ...(record.content?.intro ?? {}),
      },
      about: {
        ...fileProfile.content.about,
        ...(record.content?.about ?? {}),
      },
      contact: {
        ...fileProfile.content.contact,
        ...(record.content?.contact ?? {}),
      },
      product_focus: {
        ...fileProfile.content.product_focus,
        ...(record.content?.product_focus ?? {}),
      },
    },
  });

const withEmptyExperiences = (profile: ProfileContent): ProfileContent =>
  normalizeProfileContent({
    ...profile,
    history: {
      ...profile.history,
      experiences: [],
    },
  });

async function readProfileContentForExperienceApi(): Promise<ProfileContent> {
  const fileProfile = await readDefaultProfile();
  const connection = await dbConnect();

  if (!connection) {
    throw new Error("Database is required for portfolio administration.");
  }

  const record = await PortfolioContent.findOne({
    key: PORTFOLIO_CONTENT_KEY,
  }).lean<PortfolioContentRecord>();

  if (!record) {
    return withEmptyExperiences(fileProfile);
  }

  return mergeProfileRecordWithFile(fileProfile, record);
}

async function writeProfileContent(profile: ProfileContent): Promise<ProfileContent> {
  const normalizedProfile = normalizeProfileContent(profile);

  const connection = await dbConnect();
  if (!connection) {
    throw new Error("Database is required to save portfolio content.");
  }
  await PortfolioContent.findOneAndUpdate(
    { key: PORTFOLIO_CONTENT_KEY },
    {
      key: PORTFOLIO_CONTENT_KEY,
      personal_details: normalizedProfile.personal_details,
      preferences: normalizedProfile.preferences,
      history: normalizedProfile.history,
      metadata: normalizedProfile.metadata,
      content: normalizedProfile.content,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  revalidateTag(PUBLIC_PROFILE_CACHE_TAG);

  return normalizedProfile;
}

function pickAdminProfileContent(
  profile: ProfileContent
): AdminProfilePayload {
  return {
    name: profile.personal_details.name,
    title: profile.personal_details.title,
    bio: profile.personal_details.bio,
    introAvailabilityAvailable:
      profile.content.intro.availability_available,
    introAvailabilityUnavailable:
      profile.content.intro.availability_unavailable,
    introHeadline: profile.content.intro.headline,
    introHighlights: profile.content.intro.highlights ?? [],
    aboutParagraphs: profile.personal_details.about_paragraphs ?? [],
    aboutHeading: profile.content.about.heading,
    aboutIntro: profile.content.about.intro,
    aboutBasedInLabel: profile.content.about.based_in_label,
    aboutSkillsHeading: profile.content.about.skills_heading,
    aboutSkillsIntro: profile.content.about.skills_intro,
    availableForOpportunities:
      profile.preferences.available_for_opportunities ?? false,
    email: profile.personal_details.contact.email,
    phone: profile.personal_details.contact.phone,
    location: profile.personal_details.location,
    linkedin: profile.personal_details.links.linkedin,
    github: profile.personal_details.links.github,
    website: profile.personal_details.links.website,
    resumeUrl: profile.personal_details.links.resume ?? "",
    contactHeading: profile.content.contact.heading,
    contactIntro: profile.content.contact.intro,
    contactBannerHeading: profile.content.contact.banner_heading,
    contactBannerIntro: profile.content.contact.banner_intro,
    contactQuickLinksNote: profile.content.contact.quick_links_note,
    contactDetailsHeading: profile.content.contact.details_heading,
    contactDetailsIntro: profile.content.contact.details_intro,
    contactFormHeading: profile.content.contact.form_heading,
    contactFormIntro: profile.content.contact.form_intro,
    contactSuccessMessage: profile.content.contact.success_message,
  };
}

function pickPublicProfileContent(
  profile: ProfileContent
): PublicProfileData {
  return {
    personal_details: profile.personal_details,
    preferences: profile.preferences,
    content: profile.content,
  };
}

const readCachedPublicProfile = unstable_cache(
  async (): Promise<PublicProfileData> => {
    const fileProfile = await readDefaultProfile();
    const connection = await dbConnectForPublicRead();

    if (!connection) {
      throw new Error("Database unavailable for public profile.");
    }

    const record = await PortfolioContent.findOne({
      key: PORTFOLIO_CONTENT_KEY,
    }).lean<PortfolioContentRecord>();

    if (!record) {
      return defaultPublicProfileData;
    }

    return pickPublicProfileContent(mergeProfileRecordWithFile(fileProfile, record));
  },
  ["public-profile"],
  { revalidate: 60, tags: [PUBLIC_PROFILE_CACHE_TAG] }
);

export async function readPublicProfileApiContent(): Promise<PublicProfileData> {
  try {
    return await readCachedPublicProfile();
  } catch (error) {
    log.warn("Falling back to default public profile content.", error);
    return pickPublicProfileContent(await readDefaultProfile());
  }
}

export async function listPublicFallbackProjects(): Promise<Project[]> {
  const fileProfile = await readDefaultProfile();

  return (fileProfile.history.featured_projects ?? []).map(toFallbackProject);
}

export async function listPublicExperiences(): Promise<ProfileExperience[]> {
  const fileProfile = await readDefaultProfile();

  try {
    const connection = await dbConnectForPublicRead();

    if (!connection) {
      return fileProfile.history.experiences;
    }

    const record = await PortfolioContent.findOne({
      key: PORTFOLIO_CONTENT_KEY,
    }).lean<PortfolioContentRecord>();

    if (!record) {
      return [];
    }

    return mergeProfileRecordWithFile(fileProfile, record).history.experiences;
  } catch (error) {
    log.warn("Falling back to default experience content.", error);
    return fileProfile.history.experiences;
  }
}

export async function readAdminProfileApiContent(): Promise<AdminProfilePayload> {
  return pickAdminProfileContent(await readProfileContentForExperienceApi());
}

export async function updateAdminProfileContent(
  data: AdminProfilePayload
): Promise<AdminProfilePayload> {
  const profile = await readProfileContentForExperienceApi();

  const updatedProfile: ProfileContent = {
    ...profile,
    personal_details: {
      ...profile.personal_details,
      name: data.name,
      title: data.title,
      bio: data.bio,
      about_paragraphs: data.aboutParagraphs,
      location: data.location,
      contact: {
        ...profile.personal_details.contact,
        email: data.email,
        phone: data.phone,
        address: data.location,
      },
      links: {
        ...profile.personal_details.links,
        website: data.website,
        github: data.github,
        linkedin: data.linkedin,
        resume: data.resumeUrl,
      },
    },
    content: {
      ...profile.content,
      intro: {
        ...profile.content.intro,
        availability_available: data.introAvailabilityAvailable,
        availability_unavailable: data.introAvailabilityUnavailable,
        headline: data.introHeadline,
        highlights: data.introHighlights,
      },
      about: {
        ...profile.content.about,
        heading: data.aboutHeading,
        intro: data.aboutIntro,
        based_in_label: data.aboutBasedInLabel,
        skills_heading: data.aboutSkillsHeading,
        skills_intro: data.aboutSkillsIntro,
      },
      contact: {
        ...profile.content.contact,
        heading: data.contactHeading,
        intro: data.contactIntro,
        banner_heading: data.contactBannerHeading,
        banner_intro: data.contactBannerIntro,
        quick_links_note: data.contactQuickLinksNote,
        details_heading: data.contactDetailsHeading,
        details_intro: data.contactDetailsIntro,
        form_heading: data.contactFormHeading,
        form_intro: data.contactFormIntro,
        success_message: data.contactSuccessMessage,
      },
    },
    preferences: {
      ...profile.preferences,
      available_for_opportunities: data.availableForOpportunities,
    },
    metadata: {
      ...profile.metadata,
      last_updated: new Date().toISOString().slice(0, 10),
    },
  };

  const persistedProfile = await writeProfileContent(updatedProfile);

  return pickAdminProfileContent(persistedProfile);
}

export async function listAdminExperiences(): Promise<ProfileExperience[]> {
  const profile = await readProfileContentForExperienceApi();
  return profile.history.experiences;
}

export async function getAdminExperienceById(
  id: string
): Promise<ProfileExperience | null> {
  const experiences = await listAdminExperiences();
  return experiences.find((experience) => experience.id === id) ?? null;
}

const persistExperiences = async (
  profile: ProfileContent,
  experiences: ProfileExperience[]
) => {
  const updatedProfile: ProfileContent = {
    ...profile,
    history: {
      ...profile.history,
      experiences: normalizeExperiences(experiences),
    },
    metadata: {
      ...profile.metadata,
      last_updated: new Date().toISOString().slice(0, 10),
    },
  };

  const persistedProfile = await writeProfileContent(updatedProfile);

  return persistedProfile.history.experiences;
};

export async function createAdminExperience(
  data: AdminExperiencePayload
): Promise<ProfileExperience> {
  const profile = await readProfileContentForExperienceApi();

  const nextExperience: ProfileExperience = {
    role: data.role,
    company: data.company,
    period: data.period,
    location: data.location,
    summary: data.summary,
    highlights: data.highlights,
  };

  const nextExperiences = data.setAsCurrent
    ? [
        nextExperience,
        ...profile.history.experiences.map((experience, index) =>
          index === 0 ? toPreviousExperience(experience, data.period) : experience
        ),
      ]
    : [...profile.history.experiences, nextExperience];

  const experiences = await persistExperiences(profile, nextExperiences);
  return experiences[data.setAsCurrent ? 0 : experiences.length - 1];
}

export async function updateAdminExperience(
  id: string,
  data: AdminExperiencePayload
): Promise<ProfileExperience | null> {
  const profile = await readProfileContentForExperienceApi();
  const currentIndex = profile.history.experiences.findIndex(
    (experience) => experience.id === id
  );

  if (currentIndex === -1) {
    return null;
  }

  const currentExperience = profile.history.experiences[currentIndex];
  const updatedExperience: ProfileExperience = {
    ...currentExperience,
    role: data.role,
    company: data.company,
    period: data.period,
    location: data.location,
    summary: data.summary,
    highlights: data.highlights,
  };

  const remainingExperiences = profile.history.experiences.filter(
    (experience) => experience.id !== id
  );

  const nextExperiences = data.setAsCurrent
    ? [
        updatedExperience,
        ...remainingExperiences.map((experience, index) =>
          index === 0 ? toPreviousExperience(experience, data.period) : experience
        ),
      ]
    : [
        ...remainingExperiences.slice(0, currentIndex),
        updatedExperience,
        ...remainingExperiences.slice(currentIndex),
      ];

  const experiences = await persistExperiences(profile, nextExperiences);
  return experiences.find((experience) => experience.id === id) ?? experiences[0] ?? null;
}

export async function deleteAdminExperience(id: string): Promise<boolean> {
  const profile = await readProfileContentForExperienceApi();
  const nextExperiences = profile.history.experiences.filter(
    (experience) => experience.id !== id
  );

  if (nextExperiences.length === profile.history.experiences.length) {
    return false;
  }

  await persistExperiences(profile, nextExperiences);
  return true;
}
