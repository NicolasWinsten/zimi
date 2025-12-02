

import { List, ListItem, ListItemText, Link, Box, Typography } from '@mui/material';
import { MaShanZheng, NotoSerifChinese } from './fonts';
import { getDictionaryEntry } from 'app/lib/dictionary';


function EntryView({ pinyin, meanings }) {
  return (
    <Box>
      <Typography 
        variant="body2"
        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
      >
        {pinyin}
      </Typography>
      <Typography 
        variant="body1"
        sx={{ mb: 0.5 }}
      >
        {meanings.join('; ')}
      </Typography>
    </Box>
  );
}

export default function WordList({ words }) {
  return (
    <List sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
      {words.map((word, index) => {
        const entries = getDictionaryEntry(word)?.forms;
        if (!entries) return null;
        const dongChineseUrl = `https://www.dong-chinese.com/dictionary/${encodeURIComponent(word)}`;

        return (
          <ListItem 
            key={index}
            sx={{ 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              borderBottom: '1px solid #e0e0e0',
              py: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography 
                variant="h5" 
                component="span"
                sx={{ fontWeight: 400, whiteSpace: 'nowrap'}}
              >
                <span className={MaShanZheng.className}>{word}</span>
              </Typography>
              <Box>
                {entries.map((form, idx) => (
                  <EntryView 
                    key={idx}
                    pinyin={form.transcriptions?.pinyin || ''}
                    meanings={form.meanings || []}
                  />
                ))}
              </Box>
              
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}