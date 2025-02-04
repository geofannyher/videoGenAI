import axios from "axios";
export type TElevenlabsProps = {
  text: string;
};
export const textToSpeech = async ({ text }: TElevenlabsProps) => {
  try {
    const result = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/EnitCcXAWjwwtZGymrPK`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.38,
          similarity_boost: 1,
          style: 0,
          use_speaker_boost: false,
        },
      },
      {
        headers: {
          accept: "audio/mpeg",
          "xi-api-key": "17dd999e77442c6c7e1e7733e6dd7af2",
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    return result;
  } catch (error) {
    return error;
  }
};
