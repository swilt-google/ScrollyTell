"""
Test ManimGL without LaTeX
"""
from renderer import render_manim_code

# Test with Text instead of Tex (no LaTeX required)
test_code = """
class SimpleTest(Scene):
    def construct(self):
        # Use Text instead of Tex - no LaTeX needed
        text = Text("Hello Manim!")
        text.set_color(BLUE)
        self.play(Write(text))
        self.wait(1)
"""

try:
    video_url = render_manim_code(test_code, "SimpleTest", "test_simple")
    print(f"✅ Simple test successful! Video at: {video_url}")
except Exception as e:
    print(f"❌ Simple test failed: {e}")
    import traceback
    traceback.print_exc()
