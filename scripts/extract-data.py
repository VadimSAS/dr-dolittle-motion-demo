import json
import shutil
from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
source = Path(r'C:\Users\user\Documents\GitHub\dr-dolittle-site\dist')
patients = {
    'blog-message391.jpg': ('Рич', 'Экстренная операция при непроходимости кишечника'),
    'blog-message763.jpg': ('Чупа', 'Диагностика и лечение многократной рвоты'),
    'blog-message710.jpg': ('Сэм', 'Экстренная хирургическая помощь'),
    'blog-message418.jpg': ('Дайкири', 'Лечение осложнения после операции'),
}
stories = []
for index, card in enumerate(BeautifulSoup((source/'blog.html').read_text(encoding='utf-8'), 'html.parser').select('article.story-card')):
    images = list(dict.fromkeys(i['src'] for i in card.select('img')))
    story = dict(id=f'story-{index+1}', title=card.select_one('h3').get_text(),
                 date=card.select_one('time')['datetime'],
                 category=card.select_one('.story-category').get_text(),
                 paragraphs=[p.get_text() for p in card.select('.story-full-text p')], images=images)
    for image in images:
        dest = root/'public'/image
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source/image, dest)
        if Path(image).name in patients:
            story['patient'], story['summary'] = patients[Path(image).name]
    stories.append(story)
(root/'src/data').mkdir(exist_ok=True)
(root/'src/data/stories.json').write_text(json.dumps(stories, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Preserved {len(stories)} stories, {sum(bool(s["images"]) for s in stories)} with photos; {sum("patient" in s for s in stories)} pilot patients')

