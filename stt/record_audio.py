import sys
import sounddevice as sd
import soundfile as sf
import numpy as np
from PyQt6.QtWidgets import (QApplication, QMainWindow, QPushButton, 
                           QVBoxLayout, QWidget, QLabel, QFileDialog,
                           QTextEdit)
from PyQt6.QtCore import Qt, QTimer
from whisper import WhisperPipeline

class AudioRecorderWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Audio Recorder")
        self.setGeometry(100, 100, 500, 400)
        
        # Initialize recording variables
        self.is_recording = False
        self.sample_rate = 44100
        self.channels = 1
        self.recording_data = []
        self.current_file = None
        self.whisper = None
        
        # Create central widget and layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        
        # Create status label
        self.status_label = QLabel("Ready to record")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.status_label)
        
        # Create record button
        self.record_button = QPushButton("Start Recording")
        self.record_button.clicked.connect(self.toggle_recording)
        layout.addWidget(self.record_button)
        
        # Create save button
        self.save_button = QPushButton("Save Recording")
        self.save_button.clicked.connect(self.save_recording)
        self.save_button.setEnabled(False)
        layout.addWidget(self.save_button)
        
        # Create transcribe button
        self.transcribe_button = QPushButton("Transcribe Recording")
        self.transcribe_button.clicked.connect(self.transcribe_recording)
        self.transcribe_button.setEnabled(False)
        layout.addWidget(self.transcribe_button)
        
        # Create text area for transcription
        self.transcription_text = QTextEdit()
        self.transcription_text.setReadOnly(True)
        self.transcription_text.setPlaceholderText("Transcription will appear here...")
        layout.addWidget(self.transcription_text)
        
        # Timer for updating recording time
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_recording_time)
        self.recording_duration = 0
        
    def toggle_recording(self):
        if not self.is_recording:
            # Start recording
            self.recording_data = []
            self.recording_duration = 0
            self.is_recording = True
            self.record_button.setText("Stop Recording")
            self.status_label.setText("Recording... (0:00)")
            self.save_button.setEnabled(False)
            
            # Start the audio stream
            self.stream = sd.InputStream(
                channels=self.channels,
                samplerate=self.sample_rate,
                callback=self.audio_callback
            )
            self.stream.start()
            self.timer.start(1000)  # Update every second
            
        else:
            # Stop recording
            self.is_recording = False
            self.stream.stop()
            self.stream.close()
            self.timer.stop()
            self.record_button.setText("Start Recording")
            self.status_label.setText("Recording finished")
            self.save_button.setEnabled(True)
    
    def audio_callback(self, indata, frames, time, status):
        if status:
            print(f"Status: {status}")
        self.recording_data.append(indata.copy())
    
    def update_recording_time(self):
        self.recording_duration += 1
        minutes = self.recording_duration // 60
        seconds = self.recording_duration % 60
        self.status_label.setText(f"Recording... ({minutes}:{seconds:02d})")
    
    def save_recording(self):
        if not self.recording_data:
            return
            
        file_name, _ = QFileDialog.getSaveFileName(
            self,
            "Save Audio File",
            "",
            "WAV Files (*.wav)"
        )
        
        if file_name:
            # Combine all recorded chunks
            audio_data = np.concatenate(self.recording_data, axis=0)
            # Save as WAV file
            sf.write(file_name, audio_data, self.sample_rate)
            self.current_file = file_name
            self.status_label.setText("Recording saved successfully")
            self.transcribe_button.setEnabled(True)
            
    def transcribe_recording(self):
        if not self.current_file:
            self.status_label.setText("No recording available to transcribe")
            return
            
        try:
            if self.whisper is None:
                self.status_label.setText("Initializing Whisper model...")
                self.whisper = WhisperPipeline()
            
            self.status_label.setText("Transcribing...")
            result = self.whisper.transcribe(self.current_file)
            self.transcription_text.setText(result["text"])
            self.status_label.setText("Transcription completed")
        except Exception as e:
            self.status_label.setText(f"Error during transcription: {str(e)}")

def main():
    app = QApplication(sys.argv)
    window = AudioRecorderWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 