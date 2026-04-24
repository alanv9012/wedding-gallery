import "server-only";
import type { Photo } from "@/types";
import { getSupabaseServerClient, type PhotoRow } from "@/lib/db/supabase";

export type CreatePhotoInput = {
  eventSlug: string;
  fileKey: string;
  url: string;
  approved?: boolean;
};

export type ApprovedPhotosPageInput = {
  eventSlug: string;
  offset: number;
  limit: number;
};

export interface PhotoRepository {
  createPhoto(input: CreatePhotoInput): Promise<Photo>;
  getApprovedPhotos(eventSlug: string): Promise<Photo[]>;
  getApprovedPhotosPage(input: ApprovedPhotosPageInput): Promise<Photo[]>;
  getAllPhotos(eventSlug: string): Promise<Photo[]>;
  getPhotoById(photoId: string): Promise<Photo | null>;
  updatePhotoStatus(photoId: string, approved: boolean): Promise<Photo | null>;
  deletePhoto(photoId: string): Promise<void>;
}

function mapPhotoRowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    eventSlug: row.event_slug,
    fileKey: row.file_key,
    url: row.url,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export function createPhotoRepository(): PhotoRepository {
  const supabase = getSupabaseServerClient();

  return {
    async createPhoto(input: CreatePhotoInput): Promise<Photo> {
      const { data, error } = await supabase
        .from("photos")
        .insert({
          event_slug: input.eventSlug,
          file_key: input.fileKey,
          url: input.url,
          approved: input.approved ?? false,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error("Unable to create photo metadata.");
      }

      return mapPhotoRowToPhoto(data);
    },

    async getApprovedPhotos(eventSlug: string): Promise<Photo[]> {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("event_slug", eventSlug)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Unable to load approved photos.");
      }

      return (data ?? []).map(mapPhotoRowToPhoto);
    },

    async getApprovedPhotosPage(input: ApprovedPhotosPageInput): Promise<Photo[]> {
      const from = input.offset;
      const to = input.offset + input.limit - 1;

      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("event_slug", input.eventSlug)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error("Unable to load approved photos page.");
      }

      return (data ?? []).map(mapPhotoRowToPhoto);
    },

    async getAllPhotos(eventSlug: string): Promise<Photo[]> {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("event_slug", eventSlug)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Unable to load photos.");
      }

      return (data ?? []).map(mapPhotoRowToPhoto);
    },

    async getPhotoById(photoId: string): Promise<Photo | null> {
      const { data, error } = await supabase.from("photos").select("*").eq("id", photoId).maybeSingle();

      if (error) {
        throw new Error("Unable to load photo.");
      }

      if (!data) {
        return null;
      }

      return mapPhotoRowToPhoto(data);
    },

    async updatePhotoStatus(photoId: string, approved: boolean): Promise<Photo | null> {
      const { data, error } = await supabase
        .from("photos")
        .update({ approved })
        .eq("id", photoId)
        .select()
        .maybeSingle();

      if (error) {
        throw new Error("Unable to update photo status.");
      }

      if (!data) {
        return null;
      }

      return mapPhotoRowToPhoto(data);
    },

    async deletePhoto(photoId: string): Promise<void> {
      const { error } = await supabase.from("photos").delete().eq("id", photoId);

      if (error) {
        throw new Error("Unable to delete photo.");
      }
    },
  };
}
