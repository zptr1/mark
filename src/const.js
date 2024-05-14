export const RE_LINK = /https?:\/\/(www\.)?[-a-z\d@:%._\+~#=]{1,256}\.[a-z\d()]{1,6}\b([-a-z\d()@:%_\+.~#?&//=]*)/gi;
export const RE_DISCORD_SERVER_LINK = /((https?:\/\/)([a-z_-]+\.)?discord\.(com\/invite|gg)\/[\w\d_-]+)|(\.gg\/[\w\d_-]+)/gi;
export const RE_CENSORED_WORDS = /\b(fa+g+(o+t)?|ne+gr[oa]*|ni+g+(a+s*|e+rs*)|ra+p(er?|ing)s?|cu+nt|pe+do+(phi+le+)?s?)\b/gi;

// minimal pair count before users can use `/generate`
export const MIN_PAIR_COUNT = 15;
