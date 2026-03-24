# Deployment Guide - Gloria.exe Website

## Pre-Deployment Checklist

- [x] Enhanced mobile responsiveness
- [x] Added interactive elements (floating particles, typing animation)
- [x] Created projects gallery with GitHub integration
- [x] Added GitHub API endpoints
- [x] Tested all routes and functionality locally
- [x] Updated documentation

## Deployment Commands

### 1. Sync files to production server
```bash
rsync -avz --exclude node_modules --exclude tokens.json ./ pinecone:/var/www/gloriadotexe.online/
```

### 2. Install dependencies and restart
```bash
ssh pinecone "cd /var/www/gloriadotexe.online && yarn install && pm2 restart gloria"
```

### 3. Verify deployment
```bash
curl https://gloriadotexe.online
curl https://gloriadotexe.online/projects
curl https://gloriadotexe.online/api/github/repos
```

## New Features to Test

1. **Homepage Enhancements**
   - Floating glitch particles
   - Typewriter animation on subtitle
   - Enhanced button hover effects
   - Mobile responsive layout

2. **Projects Page (/projects)**
   - Static project showcase
   - GitHub repository integration
   - Responsive grid layout
   - Navigation back to homepage

3. **GitHub API Integration**
   - `/api/github/repos` - Live repository data
   - `/api/github/user` - Profile information
   - Error handling for API failures

## Environment Variables

Current `.env` configuration:
```
TUMBLR_CLIENT_ID=2OuzYjf4sTacIRq73Dayx0eEk759l2gkZ46kblGSnJFVGy2OpT
TUMBLR_CLIENT_SECRET=v6j8SpmjY76fGFTLyd5xlVSE08SpLLZmSORgQtVoOSPBpPKH49
PORT=3000
```

## PM2 Process Management

- **View logs**: `pm2 logs gloria`
- **Check status**: `pm2 status`
- **Restart**: `pm2 restart gloria`
- **Stop**: `pm2 stop gloria`

## Post-Deployment Testing

1. **Visual Testing**:
   - [ ] Homepage loads with new animations
   - [ ] Projects page displays correctly
   - [ ] Mobile layout works on different screen sizes
   - [ ] All hover effects and animations work

2. **API Testing**:
   - [ ] GitHub repos API returns valid data
   - [ ] GitHub user API returns profile info
   - [ ] Error handling works for API failures
   - [ ] CORS and security headers are proper

3. **Performance Testing**:
   - [ ] Page load times are acceptable
   - [ ] Animations are smooth on mobile
   - [ ] No console errors in browser
   - [ ] Memory usage is reasonable

## Rollback Plan

If issues occur:
```bash
# Check PM2 logs
pm2 logs gloria

# Restart service
pm2 restart gloria

# If major issues, restore from backup
# (previous version should be in git history)
```

## Security Notes

- GitHub API calls use public endpoints only
- No authentication tokens stored in frontend
- HTTPS enforced by nginx reverse proxy
- Rate limiting handled by GitHub's API limits

---

**Ready for deployment!** 🚀

All enhancements are complete and tested. The website now has:
- Beautiful interactive animations
- Proper mobile responsiveness  
- Dynamic GitHub integration
- Professional projects showcase
- Maintaining the signature retro-glitch aesthetic

*Time to broadcast from the static.* ✧