"""
Locust Load Test: User Simulation
Simulates realistic user behavior patterns

Usage:
    locust -f locustfile.py --host=http://localhost:8080
    Then open http://localhost:8089
"""

from locust import HttpUser, task, between
import random
import base64
import json

class MailBlastUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """Login when user starts"""
        response = self.client.post("/auth/login", json={
            "email": "loadtest@mailblast.test",
            "password": "LoadTest123!@#"
        })
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("data", {}).get("token")
            self.client.headers.update({
                "Authorization": f"Bearer {self.token}"
            })

    @task(3)
    def view_campaigns(self):
        """View campaigns list - most common action"""
        self.client.get("/campaigns")

    @task(2)
    def view_analytics(self):
        """View analytics - common action"""
        self.client.get("/analytics/overview")

    @task(1)
    def create_campaign(self):
        """Create campaign - less common"""
        self.client.post("/campaigns", json={
            "name": f"Load Test Campaign {random.randint(1, 10000)}",
            "subject": "Load Test Subject",
            "from_name": "Test Sender",
            "from_email": "test@example.com",
            "content": "<p>Test content</p>"
        })

    @task(5)
    def track_open(self):
        """Track email open - very common"""
        message_id = f"test-{random.randint(1, 100000)}"
        self.client.get(
            f"/track/open/{message_id}",
            name="/track/open/[id]"
        )

    @task(3)
    def track_click(self):
        """Track email click - common"""
        message_id = f"test-{random.randint(1, 100000)}"
        url = base64.b64encode(b"https://example.com").decode()
        self.client.get(
            f"/track/click/{message_id}?url={url}",
            name="/track/click/[id]"
        )

    @task(1)
    def view_contacts(self):
        """View contacts - occasional"""
        self.client.get("/contacts")

