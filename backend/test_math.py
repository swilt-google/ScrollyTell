"""
Test ManimGL with MathTex (alternative to Tex)
"""
from renderer import render_manim_code

# Test with MathTex instead of Tex
test_code = """
class MathTest(Scene):
    def construct(self):
        # Try MathTex instead of Tex
        equation = MathTex("2x", "+", "3", "=", "7")
        equation.set_color(BLUE)
        self.play(Write(equation))
        self.wait(1)
        
        # Solution
        solution = MathTex("x", "=", "2")
        solution.set_color(YELLOW)
        solution.next_to(equation, DOWN)
        self.play(Write(solution))
        self.wait(1)
"""

try:
    video_url = render_manim_code(test_code, "MathTest", "test_math")
    print(f"✅ MathTex test successful! Video at: {video_url}")
except Exception as e:
    print(f"❌ MathTex test failed: {e}")
    import traceback
    traceback.print_exc()
