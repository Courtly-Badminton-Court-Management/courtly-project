### Badminton Court Management and Booking System
# **Courtly Frontend Documentation**

**Local Host:**

```
http://localhost:3001/
```

**Base URL:**

```
http://localhost:8001/
```

**Database PosgresSQL:**

```
http://localhost:5050/
```

---
---

# **✈️ Visitors Area**

## `LandingPage.tsx`
**Descrition:** This is the first page to show visitor what is courtly? and provode some available slot of the day. so visitor can understand faster what courtly provide.

**Access:** Everyone can access.

**Relation:**
- **GET api/available_slot**  for  `AvailableSlotPanel.tsx` to show available slot for visitor
- use `CourtLocation.tsx`
- link to `RegisterPage.tsx` or `LoginPage.tsx` to guide user for login and user can make booking after login
- link to `AboutUsPage.tsx` on footer

---

## `RegisterPage.tsx`
**Descrition:** This page is to collect important personal data for future booking and authentication like email,password,username,firstname-lastname

**Access:** Everyone can access.

**Relation:**
- **POST api/auth/register** to save user data to database
- redirect to `LoginPage.tsx` when register done
- new courtly member will assign as a player role by default (to set manager role need manually change from the database)

## `LoginPage.tsx`

**Descrition:** This page is to authenticate and login to the courtly website. both player and manager use the same page to login.

**Access:** Everyone can access.

**Relation:**
- **POST api/auth/login** to authenticate and get user's role classify area. if player role it's will redirect to `PlayerHomePage.tsx`. For manager, it's `ManagerDashboardPage.tsx`. 





---
---


# **🏸 Players Area**

## `PlayerNavbar.tsx`
**Descrition:** Player NavBar component will stick with every related player's page after login  navigate player to different pages. 

**Access:** Only Player role.

**Relation:**
- use `src/app/(player)/layout.tsx` to host for every player's page.
- **GET api/auth/me** after login, both player and manager can see their profile in navbar like username, profile's picture and balances coin. and can get **_last_login_** field to check if this is player firstmeet or not. if first meet it's will popup `WelcomeModal.tsx` and `PickProfileModal.tsx` to enhance user experience.
- **POST api/auth/me** so, player can change some of their personal data later like username, firstname, lastname and user's profile pic or **_avatar_key_** field.  if player select the profile from `PickProfileModal.tsx`.
- **Logout** because of technical debt the logout feature will **_just clear the user's token from session storage_**. not have any endpoint for this. and to logout it's will open `LogoutModal.tsx` to confirm logout.
- **Profile Picture** this is quite secret feature, if player click on thier profile picture, the `PickProfileModal.tsx` also open and player can change thier profile anytime
- there is 4 different pages that navbar can navigate player to  which are _Home, Booking, Wallet and History_

## `PlayerHomePage.tsx`
**Descrition:** This is the first after player login. it's should show the important thing and can guide player to make booking.

**Access:** Only Player role.

**Relation:**
- **GET api/available-slots** for `CalendarPanel.tsx` to show overview percentage of avaible left for each day. and for show available slot of selected date through `AvailableSlotPanel.tsx` on the side of calendar 
- **GET api/booking/upcoming** to show in `UpcomingPanel.tsx` below calendar, so player can quick look to thier upcoming booking easier.
- **GET api/auth/me** so, player can change some of their personal data later like username, firstname, lastname and user's profile pic or **_avatar_key_** field.  if player select the profile from `PickProfile.tsx`. We can change the data.

---

## `PlayerBookingPage.tsx`
**Descrition:** This page is the key feature of courtly, Booking Page that use to select any slot player want and player can make booking using this page.

**Access:** Only Player role.

**Relation:**
- GET api/month-view/


---

## `PlayerHistoryPage.tsx`
**Descrition:**

**Access:** Only Player role.

**Relation:**


---

## `PlayerAboutUsPage.tsx`
**Descrition:**

**Access:** Only Player role.

**Relation:**

---

## `PlayerPersonalPage.tsx`
**Descrition:**

**Access:** Only Player role.

**Relation:**

---
---

# **💻 Managers Area**

---

## `ManagerDashboardPage.tsx`
**Descrition:**

**Access:** Only Manager role.

**Relation:**


---

## `ManagerControlPage.tsx`
**Descrition:**

**Access:** Only Manager role.

**Relation:**


---

## `ManagerApprovalPage.tsx`
**Descrition:**

**Access:** Only Manager role.

**Relation:**


---

## `ManagerLogPage.tsx`
**Descrition:**

**Access:** Only Manager role.

**Relation:**

---

## `ManagerSettingPage.tsx`
**Descrition:**

**Access:** Only Manager role.

**Relation:**

