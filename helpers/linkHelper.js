
// Links & @s Helper
export const replaceURLs = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const atSymbolRegex = /(?<!https?:\/\/[^\s])@(\w+)(?![^\s])/g;
  
    return text
      .replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
      .replace(atSymbolRegex, (match, username) => `<a href="/wave/${username}" target="_blank">@${username}</a>`);
  };

  export function extractTwitchUsername(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.twitch.tv' || urlObj.hostname === 'twitch.tv') {
        // Extract username from the path
        const pathParts = urlObj.pathname.split('/');
        const username = pathParts[pathParts.length - 1];
        return username;
      }
    } catch (error) {
      console.error('Error extracting Twitch username:', error);
    }
    return null;
  }