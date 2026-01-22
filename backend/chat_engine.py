import openai
from database import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
import asyncio

class ChatEngine:
    def __init__(self):
        self.api_key = LLM_API_KEY
        self.base_url = LLM_BASE_URL
        self.model = LLM_MODEL
        self.client = None

        if self.api_key:
            self.client = openai.AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )

    async def generate_response(self, user_message: str) -> str:
        """
        Generates a response using the LLM or a fallback mock if no key is present.
        """
        if not self.client:
            return self._mock_response(user_message)

        system_prompt = """You are the AI Assistant for the Cosmic Data Fusion platform, a specialized astronomical data analysis tool.
        
        Your Capabilities:
        1. Explaining features: Uploading FITS/HDF5 files, visualizing data (Scatter, Histogram, 3D), and detecting anomalies.
        2. Astronomical Knowledge: Answering questions about celestial objects, coordinates (RA/Dec), fluxes, and red shifts.
        3. Data Analysis: Helping users understand statistical outliers and quality flags.

        Tone: Professional, helpful, and scientifically accurate.
        
        If asked about things unrelated to astronomy or the website, politely steer the conversation back to cosmic data.
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm having trouble connecting to the cosmic network right now. Please check your connection or try again later."

    def _mock_response(self, message: str) -> str:
        """Fallback for when no API key is configured."""
        msg = message.lower()
        
        if "upload" in msg:
            return "To **upload data**, click the 'Upload' button in the top bar. We support **FITS**, **HDF5**, and **CSV** files. Once uploaded, your data is automatically standardized and analyzed."
        
        if "plot" in msg or "chart" in msg or "visual" in msg:
            return "We offer several visualization options:\n- **Scatter Plot**: Good for correlating two variables (like RA vs Dec).\n- **Histogram**: View distribution of a single value.\n- **3D Plot**: Explore data in three dimensions.\n- **Sky Map**: See the spatial density of your data."
        
        if "anomaly" in msg:
            return "Our **AI Anomaly Detector** uses an Isolation Forest algorithm to find unusual data points. You can see them highlighted in the charts and listed in the 'Anomalies' panel."
        
        if "report" in msg:
            return "You can generate a comprehensive **PDF Research Report** by clicking the 'Generate Report' button. It includes statistical summaries and AI insights."

        return "I am the Cosmic Data Fusion Assistant (Mock Mode). \n\nI can answer basic questions about:\n- Uploading Data\n- Visualizations\n- Anomaly Detection\n- Reports\n\n**Note**: To enable full AI chat capabilities, please configure the `LLM_API_KEY` in the backend."
