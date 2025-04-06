import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
#from datasets import load_dataset
from typing import Optional, Union, Dict
import logging
import importlib.util
import subprocess
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except FileNotFoundError:
        install_command = {
            'darwin': 'brew install ffmpeg',  # macOS
            'linux': 'sudo apt-get install ffmpeg',  # Ubuntu/Debian
            'win32': 'choco install ffmpeg'  # Windows with Chocolatey
        }.get(sys.platform, 'Please install ffmpeg manually')
        
        raise ImportError(
            f"ffmpeg is not installed but is required for audio processing.\n"
            f"Please install it using:\n{install_command}"
        )

def check_accelerate():
    """Check if accelerate is installed and at the right version"""
    if importlib.util.find_spec("accelerate") is None:
        raise ImportError(
            "The package 'accelerate' is required. Please install it with: pip install 'accelerate>=0.26.0'"
        )

class WhisperPipeline:
    def __init__(
        self,
        model_id: str = "openai/whisper-large-v3-turbo",
        device: Optional[str] = None,
        torch_dtype: Optional[torch.dtype] = None
    ):
        """
        Initialize the Whisper pipeline for speech recognition.
        
        Args:
            model_id (str): The model identifier from HuggingFace hub
            device (str, optional): Device to run the model on ('cuda:0' or 'cpu')
            torch_dtype (torch.dtype, optional): Torch data type for the model
        """
        # Check dependencies
        check_accelerate()
        check_ffmpeg()
        
        # Set dtype (device is handled by accelerate)
        self.torch_dtype = torch_dtype or (torch.float16 if torch.cuda.is_available() else torch.float32)
        
        logger.info(f"Initializing Whisper pipeline with dtype: {self.torch_dtype}")
        
        try:
            # Load model with accelerate handling device mapping
            self.model = AutoModelForSpeechSeq2Seq.from_pretrained(
                model_id,
                torch_dtype=self.torch_dtype,
                low_cpu_mem_usage=True,
                use_safetensors=True,
                device_map="auto"
            )
            
            # Load processor
            self.processor = AutoProcessor.from_pretrained(model_id)
            
            # Create pipeline without specifying device (let accelerate handle it)
            self.pipe = pipeline(
                "automatic-speech-recognition",
                model=self.model,
                tokenizer=self.processor.tokenizer,
                feature_extractor=self.processor.feature_extractor,
                torch_dtype=self.torch_dtype,
            )
            
            logger.info("Pipeline initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing pipeline: {str(e)}")
            raise
    
    def transcribe(self, audio_input: Union[str, Dict]) -> Dict:
        """
        Transcribe audio using the Whisper pipeline.
        
        Args:
            audio_input: Either a path to an audio file or a dictionary containing audio data
                        (as returned by datasets library)
        
        Returns:
            Dict containing the transcription result
        """
        try:
            result = self.pipe(audio_input)
            return result
        except Exception as e:
            logger.error(f"Error during transcription: {str(e)}")
            raise

def main():
    """Example usage of the WhisperPipeline class"""
    try:
        # Initialize pipeline
        whisper = WhisperPipeline()
        
        # Specify an audio file path for testing
        audio_file = "/Users/vishi/Hackathon Essec/TUMai-LaGent/data/audio-test.wav"
        
        # Perform transcription
        result = whisper.transcribe(audio_file)
        print("Transcription:", result["text"])
        
    except ImportError as e:
        logger.error(f"Dependency error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")

if __name__ == "__main__":
    main()
