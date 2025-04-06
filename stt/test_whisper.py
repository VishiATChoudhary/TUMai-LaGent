from whisper import WhisperPipeline
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        # Initialize the pipeline
        whisper = WhisperPipeline()
        
        # Path to your audio file
        audio_file = "/Users/vishi/Hackathon Essec/TUMai-LaGent/data/audio-test.wav"
        
        # Perform transcription
        logger.info(f"Starting transcription of {audio_file}")
        result = whisper.transcribe(audio_file)
        
        print("\nTranscription Result:")
        print("-" * 50)
        print(result["text"])
        print("-" * 50)
        
    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")

if __name__ == "__main__":
    main() 