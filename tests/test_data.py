import json
import unittest
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\user\Documents\GitHub\dr-dolittle-site\dist\blog.html')

class DataTests(unittest.TestCase):
    def test_every_original_story_and_media_is_preserved(self):
        original = BeautifulSoup(SOURCE.read_text(encoding='utf-8'), 'html.parser').select('article.story-card')
        data = json.loads((ROOT / 'src/data/stories.json').read_text(encoding='utf-8'))
        self.assertEqual(len(original), 81)
        self.assertEqual(len(data), len(original))
        for card, story in zip(original, data):
            self.assertEqual(story['paragraphs'], [p.get_text() for p in card.select('.story-full-text p')])
            self.assertEqual(story['date'], card.select_one('time')['datetime'])
            self.assertEqual(story['images'], list(dict.fromkeys(i['src'] for i in card.select('img'))))
            for image in story['images']:
                self.assertTrue((ROOT / 'public' / image).is_file())
        for name, image in [('Рич','391'), ('Чупа','763'), ('Сэм','710'), ('Дайкири','418')]:
            matches = [s for s in data if s.get('patient') == name]
            self.assertEqual(len(matches), 1)
            self.assertIn(f'assets/blog-message{image}.jpg', matches[0]['images'])

if __name__ == '__main__':
    unittest.main()

