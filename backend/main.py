"""
FastAPI Backend for Manim Video Rendering
"""
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

# Create static directory if it doesn't exist
Path("backend/static/videos").mkdir(parents=True, exist_ok=True)

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static videos
app.mount("/static", StaticFiles(directory="backend/static"), name="static")


class RenderRequest(BaseModel):
    animation_id: str


class RenderResponse(BaseModel):
    video_url: str


# Pre-defined Manim animation scripts (using Text instead of Tex for now)
ANIMATIONS = {
    "linear_solve_1": {
        "code": """
class LinearSolve(Scene):
    def construct(self):
        # Step 1: Show initial equation
        eq1 = Text("2x + 3 = 7", font_size=60)
        eq1.set_color(BLUE)
        self.play(Write(eq1))
        self.wait(1)
        
        # Step 2: Subtract 3
        eq2 = Text("2x + 3 - 3 = 7 - 3", font_size=50)
        eq2.set_color(BLUE)
        self.play(Transform(eq1, eq2))
        self.wait(1)
        
        # Step 3: Simplify
        eq3 = Text("2x = 4", font_size=60)
        eq3.set_color(BLUE)
        self.play(Transform(eq1, eq3))
        self.wait(1)
        
        # Step 4: Divide by 2
        eq4 = Text("2x/2 = 4/2", font_size=50)
        eq4.set_color(BLUE)
        self.play(Transform(eq1, eq4))
        self.wait(1)
        
        # Step 5: Solution
        eq5 = Text("x = 2", font_size=72)
        eq5.set_color(YELLOW)
        self.play(Transform(eq1, eq5), eq1.animate.scale(1.3))
        self.wait(2)
""",
        "scene_name": "LinearSolve"
    },
    "test_simple": {
        "code": """
class SimpleTest(Scene):
    def construct(self):
        text = Text("2x + 3 = 7", font_size=60)
        text.set_color(BLUE)
        self.play(Write(text))
        self.wait(1)
        
        solution = Text("x = 2", font_size=60)
        solution.set_color(YELLOW)
        solution.next_to(text, DOWN)
        self.play(Write(solution))
        self.wait(1)
""",
        "scene_name": "SimpleTest"
    }
}


@app.get("/")
def read_root():
    return {"message": "Manim rendering backend is running!"}


@app.post("/api/render", response_model=RenderResponse)
def render_animation(request: RenderRequest):
    """
    Render a pre-defined Manim animation and return the video URL.
    """
    animation_id = request.animation_id
    
    if animation_id not in ANIMATIONS:
        raise HTTPException(status_code=404, detail=f"Animation '{animation_id}' not found")
    
    anim = ANIMATIONS[animation_id]
    
    try:
        import sys
        from pathlib import Path
        # Add backend directory to path
        backend_dir = Path(__file__).parent
        if str(backend_dir) not in sys.path:
            sys.path.insert(0, str(backend_dir))
        
        from renderer import render_manim_code
        
        video_url = render_manim_code(
            code=anim["code"],
            scene_name=anim["scene_name"],
            filename_prefix=animation_id
        )
        
        return RenderResponse(video_url=video_url)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Rendering failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
