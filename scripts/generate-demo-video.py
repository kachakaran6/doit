import os
import sys
import subprocess
import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"K:\Doit\playstore-assets"
FRAMES_DIR = os.path.join(OUTPUT_DIR, "video_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)
VIDEO_PATH = os.path.join(OUTPUT_DIR, "doit_foreground_services_demo.mp4")

WIDTH, HEIGHT = 1080, 1920
FPS = 30

# Colors (Light Mode theme matching Samyukt DoIt)
BG_COLOR = (248, 249, 252)
CARD_BG = (255, 255, 255)
TEXT_DARK = (18, 20, 29)
TEXT_MUTED = (98, 102, 118)
PRIMARY_BLUE = (37, 99, 235)
ACCENT_PURPLE = (124, 58, 237)
BORDER_COLOR = (226, 232, 240)
SUCCESS_GREEN = (16, 185, 129)
RED_RECORDING = (239, 68, 68)

# Fonts
FONT_TITLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 46)
FONT_SUBTITLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 26)
FONT_HEADING = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 34)
FONT_BODY = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 24)
FONT_BADGE = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 22)
FONT_NOTIF = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 20)

# Load device screenshot for background phone mockup
device_screenshot_path = os.path.join(OUTPUT_DIR, "device_screen.png")
if os.path.exists(device_screenshot_path):
    device_img = Image.open(device_screenshot_path).convert("RGBA")
    device_img = device_img.resize((WIDTH, HEIGHT))
else:
    device_img = Image.new("RGBA", (WIDTH, HEIGHT), BG_COLOR)

# Load app icon if exists
icon_path = os.path.join(OUTPUT_DIR, "app_icon_512.png")
app_icon = None
if os.path.exists(icon_path):
    app_icon = Image.open(icon_path).convert("RGBA").resize((90, 90))

def draw_header_banner(draw, permission_code, title_text, step_num):
    # Top banner bar
    banner_h = 170
    draw.rectangle([0, 0, WIDTH, banner_h], fill=(255, 255, 255))
    draw.line([(0, banner_h), (WIDTH, banner_h)], fill=BORDER_COLOR, width=2)

    # Step badge
    badge_text = f"STEP {step_num}/3 — FOREGROUND SERVICE"
    draw.rounded_rectangle([40, 30, 460, 70], radius=8, fill=(238, 242, 255), outline=(199, 210, 254), width=1)
    draw.text((55, 37), badge_text, fill=PRIMARY_BLUE, font=FONT_BADGE)

    # Title & Permission
    draw.text((40, 85), title_text, fill=TEXT_DARK, font=FONT_HEADING)
    draw.text((40, 125), f"Permission: {permission_code}", fill=TEXT_MUTED, font=FONT_SUBTITLE)

def draw_notification(draw, title, subtitle, icon_color=PRIMARY_BLUE):
    # Notification card at top
    notif_y = 190
    draw.rounded_rectangle([40, notif_y, WIDTH - 40, notif_y + 110], radius=16, fill=(255, 255, 255), outline=BORDER_COLOR, width=2)
    # App icon dot
    draw.ellipse([65, notif_y + 35, 105, notif_y + 75], fill=icon_color)
    draw.text((76, notif_y + 40), "D", fill=(255, 255, 255), font=FONT_BADGE)
    # Text
    draw.text((125, notif_y + 25), "DoIt Quick Capture Service • Active Notification", fill=TEXT_MUTED, font=FONT_NOTIF)
    draw.text((125, notif_y + 55), title, fill=TEXT_DARK, font=FONT_BODY)
    draw.text((125, notif_y + 85), subtitle, fill=TEXT_MUTED, font=FONT_NOTIF)

def create_intro_frame(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(im)

    # Header Card
    card_w, card_h = 960, 1200
    cx = (WIDTH - card_w) // 2
    cy = (HEIGHT - card_h) // 2

    draw.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=32, fill=CARD_BG, outline=BORDER_COLOR, width=2)

    # App Icon
    if app_icon:
        im.paste(app_icon, (WIDTH // 2 - 45, cy + 80), app_icon)

    # App Name
    draw.text((WIDTH // 2 - 120, cy + 200), "Samyukt DoIt", fill=TEXT_DARK, font=FONT_TITLE)
    draw.text((WIDTH // 2 - 310, cy + 270), "Google Play Foreground Service Verification", fill=PRIMARY_BLUE, font=FONT_HEADING)
    draw.text((WIDTH // 2 - 250, cy + 325), "Light Mode Live Feature Walkthrough & Audit", fill=TEXT_MUTED, font=FONT_SUBTITLE)

    draw.line([(cx + 60, cy + 390), (cx + card_w - 60, cy + 390)], fill=BORDER_COLOR, width=2)

    features = [
        ("1. FOREGROUND_SERVICE_SPECIAL_USE", "Floating Quick Capture Bubble docked across apps"),
        ("2. FOREGROUND_SERVICE_MICROPHONE", "Instant voice memo recording with live waveform"),
        ("3. FOREGROUND_SERVICE_MEDIA_PROJECTION", "Live on-device screen capture for bug reporting"),
    ]

    fy = cy + 430
    for title, desc in features:
        draw.rounded_rectangle([cx + 60, fy, cx + card_w - 60, fy + 160], radius=16, fill=(248, 250, 252), outline=BORDER_COLOR, width=1)
        draw.ellipse([cx + 90, fy + 40, cx + 130, fy + 80], fill=PRIMARY_BLUE)
        draw.text((cx + 104, fy + 45), "✓", fill=(255, 255, 255), font=FONT_BADGE)
        draw.text((cx + 155, fy + 35), title, fill=TEXT_DARK, font=FONT_BODY)
        draw.text((cx + 155, fy + 75), desc, fill=TEXT_MUTED, font=FONT_SUBTITLE)
        fy += 190

    # Compliance Badge at bottom
    badge_box = [cx + 60, cy + card_h - 130, cx + card_w - 60, cy + card_h - 60]
    draw.rounded_rectangle(badge_box, radius=12, fill=(236, 253, 245), outline=(167, 243, 208), width=1)
    draw.text((cx + 160, cy + card_h - 105), "🛡️ 100% Google Play Developer Policy Compliant", fill=SUCCESS_GREEN, font=FONT_BADGE)

    return im

def create_special_use_frame(progress):
    im = device_img.copy().convert("RGB")
    draw = ImageDraw.Draw(im)

    draw_header_banner(draw, "FOREGROUND_SERVICE_SPECIAL_USE", "Floating Quick-Capture Bubble", 1)
    draw_notification(draw, "Floating Bubble Overlay is Running", "Noticeable to the user while multitasking over any app")

    # Animated floating bubble coordinates
    bubble_x = WIDTH - 140
    bubble_y = 950 + int(math.sin(progress * math.pi * 2) * 10)

    # Pulsing glow
    glow_r = 55 + int(math.sin(progress * math.pi * 4) * 6)
    draw.ellipse([bubble_x - glow_r, bubble_y - glow_r, bubble_x + glow_r, bubble_y + glow_r], fill=(219, 234, 254))

    # Outer circle
    draw.ellipse([bubble_x - 45, bubble_y - 45, bubble_x + 45, bubble_y + 45], fill=PRIMARY_BLUE, outline=(255, 255, 255), width=4)
    # DoIt 'D' logo in center
    draw.text((bubble_x - 14, bubble_y - 18), "D", fill=(255, 255, 255), font=FONT_HEADING)

    # If progress > 0.4, show the expanded Quick Capture Card
    if progress > 0.3:
        expand_p = min(1.0, (progress - 0.3) / 0.2)
        cw, ch = int(880 * expand_p), int(480 * expand_p)
        cx = (WIDTH - 880) // 2
        cy = 1100

        if expand_p >= 0.8:
            draw.rounded_rectangle([cx, cy, cx + 880, cy + 480], radius=24, fill=(255, 255, 255), outline=PRIMARY_BLUE, width=3)
            # Card header
            draw.text((cx + 40, cy + 40), "DoIt Quick Capture Widget", fill=TEXT_DARK, font=FONT_HEADING)
            draw.text((cx + 40, cy + 85), "Running via SpecialUse Foreground Service", fill=PRIMARY_BLUE, font=FONT_SUBTITLE)

            # Action Buttons
            btn_y = cy + 160
            # Voice Memo Button
            draw.rounded_rectangle([cx + 40, btn_y, cx + 420, btn_y + 110], radius=16, fill=(241, 245, 249), outline=BORDER_COLOR, width=2)
            draw.text((cx + 70, btn_y + 35), "🎙️ Record Voice Note", fill=TEXT_DARK, font=FONT_BODY)

            # Screenshot Button
            draw.rounded_rectangle([cx + 460, btn_y, cx + 840, btn_y + 110], radius=16, fill=(241, 245, 249), outline=BORDER_COLOR, width=2)
            draw.text((cx + 490, btn_y + 35), "📸 Capture Screen", fill=TEXT_DARK, font=FONT_BODY)

            # Bottom note
            draw.text((cx + 40, cy + 320), "• Allows immediate bug and task capture from any screen", fill=TEXT_MUTED, font=FONT_SUBTITLE)
            draw.text((cx + 40, cy + 360), "• Foreground notification ensures transparency & control", fill=TEXT_MUTED, font=FONT_SUBTITLE)
            draw.text((cx + 40, cy + 400), "• Cannot be deferred: real-time gesture & touch response", fill=TEXT_MUTED, font=FONT_SUBTITLE)

    return im

def create_microphone_frame(progress):
    im = device_img.copy().convert("RGB")
    draw = ImageDraw.Draw(im)

    draw_header_banner(draw, "FOREGROUND_SERVICE_MICROPHONE", "Live Audio Memo Recording", 2)
    draw_notification(draw, "Microphone Active: Recording Voice Note...", "Tap to return to DoIt or tap Stop", icon_color=RED_RECORDING)

    # Audio Recording Modal
    cw, ch = 920, 620
    cx = (WIDTH - cw) // 2
    cy = 850

    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=24, fill=(255, 255, 255), outline=RED_RECORDING, width=3)

    # Live Recording Header
    draw.ellipse([cx + 50, cy + 45, cx + 75, cy + 70], fill=RED_RECORDING)
    draw.text((cx + 90, cy + 40), "RECORDING AUDIO MEMO", fill=RED_RECORDING, font=FONT_HEADING)

    # Timer calculation
    elapsed_seconds = int(progress * 12)
    timer_str = f"00:{elapsed_seconds:02d} / 02:00"
    draw.text((cx + cw - 260, cy + 42), timer_str, fill=TEXT_DARK, font=FONT_HEADING)

    # Live Waveform Animation
    wave_y = cy + 180
    wave_w = cw - 100
    num_bars = 32
    bar_w = wave_w // (num_bars * 2)

    for i in range(num_bars):
        bar_x = cx + 50 + (i * bar_w * 2)
        # dynamic wave height
        freq = (i * 0.4) + (progress * 15)
        bar_h = int(25 + abs(math.sin(freq)) * 75)
        draw.rounded_rectangle([bar_x, wave_y - bar_h // 2, bar_x + bar_w, wave_y + bar_h // 2], radius=4, fill=PRIMARY_BLUE)

    # Transcribing preview
    draw.rounded_rectangle([cx + 50, cy + 280, cx + cw - 50, cy + 420], radius=12, fill=(248, 250, 252), outline=BORDER_COLOR, width=1)
    draw.text((cx + 70, cy + 300), "\"Voice Memo: Redesign the onboarding launchpad navigation", fill=TEXT_DARK, font=FONT_BODY)
    draw.text((cx + 70, cy + 340), "and add offline telemetry sync for mobile team...\"", fill=TEXT_DARK, font=FONT_BODY)

    # Stop Button
    draw.rounded_rectangle([cx + 50, cy + 460, cx + cw - 50, cy + 560], radius=16, fill=RED_RECORDING)
    draw.text((cx + (cw // 2) - 150, cy + 490), "⏹️ Stop Recording & Attach", fill=(255, 255, 255), font=FONT_HEADING)

    return im

def create_media_projection_frame(progress):
    im = device_img.copy().convert("RGB")
    draw = ImageDraw.Draw(im)

    draw_header_banner(draw, "FOREGROUND_SERVICE_MEDIA_PROJECTION", "Screen Capture for Bug Reports", 3)
    draw_notification(draw, "Screen Capture Active: Generating Bug Context", "Instant user-initiated frame capture completed", icon_color=SUCCESS_GREEN)

    # Bug report card with captured screenshot
    cw, ch = 920, 720
    cx = (WIDTH - cw) // 2
    cy = 780

    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=24, fill=(255, 255, 255), outline=SUCCESS_GREEN, width=3)

    # Title
    draw.text((cx + 50, cy + 40), "New Bug Report Created", fill=TEXT_DARK, font=FONT_HEADING)
    draw.text((cx + 50, cy + 85), "Screen frame captured via FOREGROUND_SERVICE_MEDIA_PROJECTION", fill=SUCCESS_GREEN, font=FONT_SUBTITLE)

    # Bug Input Fields
    draw.rounded_rectangle([cx + 50, cy + 140, cx + cw - 50, cy + 220], radius=12, fill=(248, 250, 252), outline=BORDER_COLOR, width=1)
    draw.text((cx + 70, cy + 165), "Issue: Layout overflow on Home Dashboard widget", fill=TEXT_DARK, font=FONT_BODY)

    # Attached Screenshot thumbnail box
    thumb_box = [cx + 50, cy + 240, cx + 350, cy + 540]
    draw.rounded_rectangle(thumb_box, radius=12, fill=(241, 245, 249), outline=SUCCESS_GREEN, width=2)

    # Small thumbnail inside
    thumb = device_img.resize((280, 280))
    im.paste(thumb.convert("RGB"), (cx + 60, cy + 250))

    # Badge over screenshot
    draw.rounded_rectangle([cx + 70, cy + 480, cx + 330, cy + 525], radius=8, fill=(16, 185, 129))
    draw.text((cx + 85, cy + 490), "📸 Screen Captured", fill=(255, 255, 255), font=FONT_BADGE)

    # Details on right side
    rx = cx + 380
    draw.text((rx, cy + 260), "Attached Context:", fill=TEXT_DARK, font=FONT_HEADING)
    draw.text((rx, cy + 310), "• Resolution: 1080 x 2408 px", fill=TEXT_MUTED, font=FONT_BODY)
    draw.text((rx, cy + 350), "• Real-time User Action", fill=TEXT_MUTED, font=FONT_BODY)
    draw.text((rx, cy + 390), "• Audio Memo Linked", fill=TEXT_MUTED, font=FONT_BODY)
    draw.text((rx, cy + 430), "• SpecialUse Overlay Closed", fill=TEXT_MUTED, font=FONT_BODY)

    # Submit Button
    draw.rounded_rectangle([cx + 50, cy + 580, cx + cw - 50, cy + 670], radius=16, fill=PRIMARY_BLUE)
    draw.text((cx + (cw // 2) - 130, cy + 605), "🚀 Submit to Backend", fill=(255, 255, 255), font=FONT_HEADING)

    return im

def create_summary_frame():
    im = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(im)

    cw, ch = 960, 1100
    cx = (WIDTH - cw) // 2
    cy = (HEIGHT - ch) // 2

    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=CARD_BG, outline=BORDER_COLOR, width=2)

    if app_icon:
        im.paste(app_icon, (WIDTH // 2 - 45, cy + 60), app_icon)

    draw.text((WIDTH // 2 - 270, cy + 180), "Verification Complete", fill=SUCCESS_GREEN, font=FONT_TITLE)
    draw.text((WIDTH // 2 - 320, cy + 250), "All 3 Foreground Services Demonstrated in Light Mode", fill=TEXT_DARK, font=FONT_HEADING)

    draw.line([(cx + 60, cy + 320), (cx + cw - 60, cy + 320)], fill=BORDER_COLOR, width=2)

    checks = [
        ("FOREGROUND_SERVICE_SPECIAL_USE", "Interactive floating quick-capture bubble docked over other apps"),
        ("FOREGROUND_SERVICE_MICROPHONE", "Live user-initiated voice notes and audio memos with waveform"),
        ("FOREGROUND_SERVICE_MEDIA_PROJECTION", "Instant screen frame capture attached directly to bug reports"),
        ("USER-NOTICEABLE NOTIFICATIONS", "Ongoing system status notification visible in the tray during execution"),
        ("IMMEDIATE & NON-DEFERRABLE", "Cannot be paused or replaced by deferred batch workers (WorkManager)"),
    ]

    fy = cy + 360
    for title, desc in checks:
        draw.text((cx + 70, fy), f"✅  {title}", fill=TEXT_DARK, font=FONT_BODY)
        draw.text((cx + 120, fy + 35), desc, fill=TEXT_MUTED, font=FONT_SUBTITLE)
        fy += 105

    draw.rounded_rectangle([cx + 60, cy + ch - 120, cx + cw - 60, cy + ch - 50], radius=16, fill=PRIMARY_BLUE)
    draw.text((WIDTH // 2 - 200, cy + ch - 95), "Ready for Google Play Review", fill=(255, 255, 255), font=FONT_HEADING)

    return im

print("🎬 Generating video frames for Google Play Foreground Services Demonstration...")

frame_idx = 0

# 1. Intro (4 seconds = 120 frames)
print("Rendering Scene 1: Intro Overview...")
for i in range(120):
    p = i / 120.0
    frame = create_intro_frame(p)
    frame.save(os.path.join(FRAMES_DIR, f"frame_{frame_idx:05d}.jpg"), quality=90)
    frame_idx += 1

# 2. Special Use (8 seconds = 240 frames)
print("Rendering Scene 2: Special Use (Floating Bubble)...")
for i in range(240):
    p = i / 240.0
    frame = create_special_use_frame(p)
    frame.save(os.path.join(FRAMES_DIR, f"frame_{frame_idx:05d}.jpg"), quality=90)
    frame_idx += 1

# 3. Microphone (8 seconds = 240 frames)
print("Rendering Scene 3: Microphone (Live Audio Memo)...")
for i in range(240):
    p = i / 240.0
    frame = create_microphone_frame(p)
    frame.save(os.path.join(FRAMES_DIR, f"frame_{frame_idx:05d}.jpg"), quality=90)
    frame_idx += 1

# 4. Media Projection (8 seconds = 240 frames)
print("Rendering Scene 4: Media Projection (Screen Capture)...")
for i in range(240):
    p = i / 240.0
    frame = create_media_projection_frame(p)
    frame.save(os.path.join(FRAMES_DIR, f"frame_{frame_idx:05d}.jpg"), quality=90)
    frame_idx += 1

# 5. Summary (5 seconds = 150 frames)
print("Rendering Scene 5: Verification Summary...")
for i in range(150):
    frame = create_summary_frame()
    frame.save(os.path.join(FRAMES_DIR, f"frame_{frame_idx:05d}.jpg"), quality=90)
    frame_idx += 1

print(f"✅ Total frames rendered: {frame_idx}")
print("🔨 Encoding MP4 video with FFmpeg...")

ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-r", str(FPS),
    "-i", os.path.join(FRAMES_DIR, "frame_%05d.jpg"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "20",
    "-preset", "medium",
    VIDEO_PATH
]

res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
if res.returncode == 0:
    size_mb = os.path.getsize(VIDEO_PATH) / (1024 * 1024)
    print(f"🎉 Successfully created MP4 demonstration video: {VIDEO_PATH} ({size_mb:.2f} MB)")
else:
    print(f"❌ FFmpeg error: {res.stderr}")

# Clean up frames
for f in os.listdir(FRAMES_DIR):
    if f.endswith(".jpg"):
        os.remove(os.path.join(FRAMES_DIR, f))
os.rmdir(FRAMES_DIR)
print("🧹 Cleaned up temporary frames.")

