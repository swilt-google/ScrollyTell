"""
ManimGL Renderer Service
Executes ManimGL scenes headless and returns video URLs
"""
import subprocess
import tempfile
import shutil
import os
from pathlib import Path


def render_manim_code(code: str, scene_name: str, filename_prefix: str) -> str:
    """
    Render Manim code to video file.
    
    Args:
        code: Python code containing a ManimGL Scene class
        scene_name: Name of the Scene class to render
        filename_prefix: Prefix for output video filename
        
    Returns:
        URL path to the rendered video (e.g., "/static/videos/filename.mp4")
    """
    with tempfile.TemporaryDirectory() as tmpdirname:
        # Write code to temporary file
        script_path = Path(tmpdirname) / f"{filename_prefix}.py"
        
        # Prepend ManimGL imports
        full_code = "from manimlib import *\n\n" + code
        script_path.write_text(full_code)
        
        # Build ManimGL command
        # Use venv's manimgl if available, otherwise system manimgl
        venv_manimgl = Path(__file__).parent / "venv" / "bin" / "manimgl"
        manimgl_cmd = str(venv_manimgl) if venv_manimgl.exists() else "manimgl"
        
        cmd = [
            manimgl_cmd,
            str(script_path),
            scene_name,
            "-w",      # Write to file (headless)
            "--hd",    # High definition (1080p60)
        ]
        
        # Execute ManimGL
        result = subprocess.run(
            cmd,
            cwd=tmpdirname,
            capture_output=True,
            text=True,
            check=False,  # Don't raise exception, we'll check manually
            env={**os.environ, "PYTHONPATH": os.getcwd()}
        )
        
        print(f"ManimGL stdout:\n{result.stdout}")
        print(f"ManimGL stderr:\n{result.stderr}")
        print(f"ManimGL return code: {result.returncode}")
        
        if result.returncode != 0:
            raise RuntimeError(f"ManimGL failed with code {result.returncode}:\n{result.stderr}")
        
        # Find output video
        # ManimGL output: videos/{script_name}/1080p60/{scene_name}.mp4
        video_path = Path(tmpdirname) / "videos" / filename_prefix / "1080p60" / f"{scene_name}.mp4"
        
        if not video_path.exists():
            # Fallback: search recursively
            found_videos = list(Path(tmpdirname).rglob(f"{scene_name}.mp4"))
            if found_videos:
                video_path = found_videos[0]
            else:
                raise FileNotFoundError(f"Could not find output video for scene {scene_name}")
        
        # Move to static directory
        OUTPUT_DIR = Path("backend/static/videos")
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        final_output_path = OUTPUT_DIR / f"{filename_prefix}_{scene_name}.mp4"
        shutil.move(str(video_path), str(final_output_path))
        
        return f"/static/videos/{final_output_path.name}"


if __name__ == "__main__":
    # Test renderer
    test_code = """
class TestScene(Scene):
    def construct(self):
        equation = Tex("2x + 3 = 7")
        self.play(Write(equation))
        self.wait()
"""
    
    try:
        video_url = render_manim_code(test_code, "TestScene", "test_render")
        print(f"✅ Test render successful! Video at: {video_url}")
    except Exception as e:
        print(f"❌ Test render failed: {e}")
        import traceback
        traceback.print_exc()
