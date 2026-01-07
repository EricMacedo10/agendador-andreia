---
description: Safe deployment workflow for production systems
---

# 🚨 CRITICAL: Safe Deployment Workflow

## RED FLAGS - STOP IMMEDIATELY IF:
- [ ] Changing authentication/authorization code
- [ ] Modifying database schema or migrations
- [ ] Touching payment/financial code
- [ ] Making changes to production config files
- [ ] System is actively being used by end-user

## MANDATORY STEPS (NO SHORTCUTS):

### 1. Research First (30min minimum)
// turbo-all
- [ ] Read official documentation
- [ ] Search for known issues with the exact stack
- [ ] Check if there are Edge Runtime compatibility concerns

### 2. Local Testing (REQUIRED)
// turbo
- [ ] Create feature branch: `git checkout -b feature/descriptive-name`
- [ ] Make changes
// turbo
- [ ] Run: `npm run build` (MUST complete successfully)
// turbo
- [ ] Run: `npm run lint` (MUST pass)
- [ ] Test locally: `npm run dev` and manual testing
- [ ] Verify ZERO errors before proceeding

### 3. Incremental Changes
- [ ] ONE file at a time (commit after each successful test)
- [ ] Clear commit messages explaining WHAT and WHY

### 4. Pre-Deploy Validation
// turbo
- [ ] Final clean build: `rm -rf .next && npm run build`
- [ ] Review all changes: `git diff main`
- [ ] Ask user: "I'm about to deploy X. Confirm it's a good time?"

### 5. Deploy with Monitoring
- [ ] Push to GitHub
- [ ] Watch Vercel build in real-time
- [ ] If build fails: STOP and revert immediately
- [ ] If build succeeds: Test production URL immediately

### 6. Rollback Plan
- [ ] If ANYTHING breaks: `git revert HEAD && git push`
- [ ] Document what went wrong
- [ ] Return to step 1

## FOR CRITICAL SYSTEMS (Andreia's system):
- NEVER deploy during business hours (9am-6pm)
- ALWAYS test with user's confirmation first
- ONE change at a time, not multiple features
