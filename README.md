# 📊 Visitors Analytics Dashboard

A modern, interactive dashboard for analyzing visitor data with real-time insights and a fully dynamic Arabic user interface.

---

## 🚀 Overview

This project provides a powerful analytics dashboard to track and visualize visitor behavior using dynamic data (e.g., from Google Sheets or APIs).

It helps you understand:

- Visitor traffic trends
- Daily activity density
- Peak usage times
- Real-time statistics

---

## ✨ Features

### 📅 Date-Based Filtering
- Select any date from the calendar
- Dashboard updates instantly based on selected date

### 📈 Visitor Density Chart
- Interactive radial chart showing visitor percentage
- Smooth animations
- Accurate calculations based on selected day

### 📊 Key Metrics

- Total Visitors
- Active Visitors (selected day)
- Visitor Density (%)

---

### 📋 Visitors Data Table

Displays real visitor records such as:

- Visitor Name / ID
- Date
- Entry Time
- Exit Time

---

### 🔄 Dynamic Data Integration

- Connected to external data source (Google Sheets / API)
- Fully dynamic (no static data)
- Auto updates on every interaction

---

## 🧠 Calculation Logic

### 📌 Visitor Density Formula
Density % = (Active Visitors / Total Visitors) × 100



- Recalculates automatically when:
  - Date changes
  - Data updates

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Modern UI + Responsive Design)
- JavaScript (Vanilla JS)

### Charts
- ApexCharts / Chart.js

### Data Source
- Google Sheets API / REST API

---

## 🌍 Language

- Dashboard UI: **Arabic 🇸🇦**
- Codebase: English (clean & maintainable)

---

## 📁 Project Structure
/project
├── index.html
├── styles.css
├── app.js
├── charts.js
└── README.md


---

## ⚙️ Setup Instructions

### 1. Prepare Data Source

Your data should include:

- Visitor Name / ID
- Date
- Entry Time
- Exit Time

---

### 2. Connect Data

- Add your API endpoint or Google Sheet link inside:
  `app.js`

---

### 3. Run Project

- Open with Live Server  
OR  
- Deploy on any hosting service

---

## 📸 UI Highlights

- 📊 Interactive Charts
- 🌙 Clean Modern UI
- 📅 Smart Filtering
- 📋 Organized Data Table
- 🇸🇦 Arabic Interface

---

## ⚠️ Notes

- Ensure date format consistency
- If no data exists for selected day → density = 0%
- Handle empty values carefully

---

## 🔮 Future Improvements

- Filtering by country / device
- Real-time WebSocket updates
- Export reports (PDF / Excel)
- Authentication system
- Backend integration (Laravel API)

---

## 👨‍💻 Author

**Omar Mohammed**

---

## ⭐ Support

If you like this project, don't forget to ⭐ the repository!