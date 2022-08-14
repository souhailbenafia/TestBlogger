import {
    createCurrentUserHook,
    createClient,
} from "next-sanity";
import createImageUrlBuilder from '@sanity/image-url'

export const sanityConfig = {

    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "production",
    apiVersion: "2021-03-25",

    useCdn:  process.env.NODE_ENV === "production",

};

export const sanityClient = createClient(
    sanityConfig,
);

export const currentUser = createCurrentUserHook(sanityConfig);

export const urlFor = source => createImageUrlBuilder(sanityConfig).image(source);