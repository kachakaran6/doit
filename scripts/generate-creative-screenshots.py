from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

out_dir = r'K:\Doit\playstore-assets\creative'
os.makedirs(out_dir, exist_ok=True)

slides = [
    {
        'file': '1_Home_Dashboard.png',
        'out': '01_PlayStore_Home_Dashboard.png',
        'badge': 'DAILY LAUNCHPAD',
        'badge_color': (59, 130, 246),
        'glow_color': (59, 130, 246),
        'title': 'Track Tasks With Speed & Clarity',
        'sub': 'Live progress rings, stat pills, and focused daily work.'
    },
    {
        'file': '2_Tasks_Board.png',
        'out': '02_PlayStore_Tasks_Board.png',
        'badge': 'SPRINT MANAGEMENT',
        'badge_color': (99, 102, 241),
        'glow_color': (99, 102, 241),
        'title': 'Organize Sprints & Workflows',
        'sub': 'Filter by Today, Inbox, or Upcoming with priority indicators.'
    },
    {
        'file': '3_Bug_Queue.png',
        'out': '03_PlayStore_Bug_Queue.png',
        'badge': 'INSTANT TELEMETRY',
        'badge_color': (244, 63, 94),
        'glow_color': (244, 63, 94),
        'title': 'Capture & Triage Bugs Rapidly',
        'sub': 'Automated device context, severity tiers, and shake intake.'
    },
    {
        'file': '4_Bug_Detail.png',
        'out': '04_PlayStore_AI_Prompt.png',
        'badge': 'AI-POWERED ACCELERATION',
        'badge_color': (168, 85, 247),
        'glow_color': (168, 85, 247),
        'title': 'Generate AI Solution Prompts',
        'sub': 'Turn tasks and bug reports into copy-ready coding prompts.'
    },
    {
        'file': '5_Our_Apps_Catalog.png',
        'out': '05_PlayStore_Our_Apps.png',
        'badge': 'SAMYUKT ECOSYSTEM',
        'badge_color': (16, 185, 129),
        'glow_color': (16, 185, 129),
        'title': 'Explore Our Companion Apps',
        'sub': 'Centralized registry of craft utilities, 100% privacy-first.'
    },
    {
        'file': '6_Settings_Ecosystem.png',
        'out': '06_PlayStore_Settings_Ecosystem.png',
        'badge': 'OFFLINE FIRST & ROBUST',
        'badge_color': (59, 130, 246),
        'glow_color': (59, 130, 246),
        'title': 'Engineered For Reliability',
        'sub': 'Native In-App Updates, dark-first styling, and zero bloat.'
    }
]

canvas_w, canvas_h = 1080, 2160
font_badge = ImageFont.truetype('segoeuib.ttf', 24)
font_title = ImageFont.truetype('segoeuib.ttf', 54)
font_sub = ImageFont.truetype('segoeui.ttf', 28)

for s in slides:
    bg = Image.new('RGB', (canvas_w, canvas_h), (8, 12, 22))

    # Glow
    glow = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gc = s['glow_color']
    gdraw.ellipse([120, 340, 960, 1100], fill=(gc[0], gc[1], gc[2], 65))
    glow = glow.filter(ImageFilter.GaussianBlur(110))
    bg.paste(Image.composite(glow, Image.new('RGBA', (canvas_w, canvas_h), (8, 12, 22, 255)), glow), (0, 0))

    draw = ImageDraw.Draw(bg)

    # Badge Pill
    bbox = font_badge.getbbox(s['badge'])
    bw = bbox[2] - bbox[0]
    bh = bbox[3] - bbox[1]
    px, py = 90, 85
    bc = s['badge_color']
    draw.rounded_rectangle([px, py, px + bw + 28, py + bh + 16], radius=16, fill=(int(bc[0]*0.2), int(bc[1]*0.2), int(bc[2]*0.2)), outline=bc, width=1)
    draw.text((px + 14, py + 7), s['badge'], font=font_badge, fill=(210, 230, 255))

    # Title & Sub
    draw.text((90, 155), s['title'], font=font_title, fill=(255, 255, 255))
    draw.text((90, 230), s['sub'], font=font_sub, fill=(148, 163, 184))

    # Mockup
    dev_w = 900
    dev_h = 1780
    dev_x = (canvas_w - dev_w) // 2
    dev_y = 330

    shadow = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([dev_x - 12, dev_y - 6, dev_x + dev_w + 12, dev_y + dev_h + 12], radius=58, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(34))
    bg.paste(Image.composite(shadow, Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0)), shadow), (0, 0), shadow)

    draw = ImageDraw.Draw(bg)
    draw.rounded_rectangle([dev_x, dev_y, dev_x + dev_w, dev_y + dev_h], radius=54, fill=(24, 29, 41), outline=(64, 73, 95), width=3)
    draw.rounded_rectangle([dev_x + 6, dev_y + 6, dev_x + dev_w - 6, dev_y + dev_h - 6], radius=48, fill=(11, 15, 23))

    scr_x = dev_x + 14
    scr_y = dev_y + 14
    scr_w = dev_w - 28
    scr_h = dev_h - 28

    screen_src = os.path.join(r'K:\Doit\playstore-assets\playstore', s['file'])
    scr_img = Image.open(screen_src).convert('RGB')
    scr_resized = scr_img.resize((scr_w, scr_h), Image.Resampling.LANCZOS)

    mask = Image.new('L', (scr_w, scr_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, scr_w, scr_h], radius=40, fill=255)

    bg.paste(scr_resized, (scr_x, scr_y), mask)

    # Dynamic island pill
    draw = ImageDraw.Draw(bg)
    pill_w, pill_h = 100, 22
    pill_x = dev_x + (dev_w - pill_w) // 2
    pill_y = scr_y + 12
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=11, fill=(0, 0, 0))

    out_file = os.path.join(out_dir, s['out'])
    bg.save(out_file, format='PNG', optimize=True)
    print('✔ Generated:', s['out'])

