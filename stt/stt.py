import boto3
import json
import numpy as np
import os
from botocore.exceptions import NoCredentialsError, CredentialRetrievalError

class WhisperSTT:
    def __init__(self, region_name='us-west-2'):  # AWS Oregon region where the endpoint is deployed
        # Verify AWS credentials are available
        if not (os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY')):
            raise CredentialRetrievalError(
                provider='env',
                error_msg='AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
            )
        
        self.runtime_client = boto3.client('runtime.sagemaker', region_name=region_name)
        self.endpoint_name = "lagent-voiceChat"

    def transcribe_audio(self, audio_data):
        """
        Transcribe audio using the Whisper Large v3 model deployed on SageMaker.
        
        Args:
            audio_data (bytes): Raw audio data in bytes
            
        Returns:
            str: Transcribed text
        """
        try:
            # Invoke the endpoint
            response = self.runtime_client.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/x-audio',  # Adjust content type if needed
                Body=audio_data
            )
            
            # Parse the response
            result = json.loads(response['Body'].read().decode())
            return result['text']
            
        except NoCredentialsError:
            print("Error: AWS credentials not found or invalid.")
            print("Please ensure you have set the following environment variables:")
            print("- AWS_ACCESS_KEY_ID")
            print("- AWS_SECRET_ACCESS_KEY")
            return None
        except Exception as e:
            print(f"Error during transcription: {str(e)}")
            return None

def test_transcription():
    """
    Test function to demonstrate usage of the WhisperSTT class
    """
    try:
        # Initialize the STT class
        stt = WhisperSTT()
        
        # Load a test audio file
        with open('data/audio-test.wav', 'rb') as audio_file:
            audio_data = audio_file.read()
        
        # Perform transcription
        transcription = stt.transcribe_audio(audio_data)
        
        if transcription:
            print("Transcription successful!")
            print("Transcribed text:", transcription)
        else:
            print("Transcription failed.")
            
    except FileNotFoundError:
        print("Please place a test_audio.wav file in the same directory to test the transcription.")
    except Exception as e:
        print(f"Error during testing: {str(e)}")

if __name__ == "__main__":
    test_transcription()
