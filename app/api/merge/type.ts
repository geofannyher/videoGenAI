import { File as FormidableFile } from "formidable";
/**
 * Tipe untuk hasil parsing form-data yang berisi file.
 */
export type UploadedFiles = {
  video?: FormidableFile[];
  audio?: FormidableFile[];
};

/**
 * Response yang dikirim ke client.
 */
export type MergeResponse = {
  success: boolean;
  message: string;
  fileName?: string;
  filePath?: string;
};
