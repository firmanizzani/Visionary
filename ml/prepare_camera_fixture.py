"""Compose local regression images for the multi-item camera test; no images are published."""
from pathlib import Path
from PIL import Image, ImageOps

if __name__ == '__main__':
    checks = Path(__file__).parent / 'checks'
    canvas = Image.new('RGB', (960, 960), 'white')
    for index, filename in enumerate(['user-glasses.png', 'wallet.jpg', 'lamp.jpg', 'perfume.jpg']):
        image = ImageOps.contain(Image.open(checks / filename).convert('RGB'), (440, 440))
        x = (index % 2) * 480 + (480 - image.width) // 2
        y = (index // 2) * 480 + (480 - image.height) // 2
        canvas.paste(image, (x, y))
    canvas.save(checks / 'multi-items.jpg', quality=95)
    print('Prepared ignored multi-items.jpg camera regression fixture')
