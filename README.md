# Procter and TA Management System

- **Ahed Alaryan** (22201181)
- **Arda Kırcı** (22002031)
- **Ayşe Vildan Çetin** (22203353)
- **Buğra Malkara** (22103567)
- **Kamil Berkay Çetin** (22203156)



---

## 3.1 & 3.2 Motivation and Goals Behind the Project

Our main aim is to create a web application that keeps track of and simplifies TA and Procter work for engineering classes. This program was made to decrease or eliminate the general problems that arise with TA and Procter assignments, which include conflict between assignments, a conflict in the TA’s assignment and schedule, an unfairly imbalanced workload, etc. These problems generally decrease the TA’s organization and productivity, leading to errors in grading and an increased chance of quitting the role.

Our main goal is to create a system that keeps track of all the information a TA needs automatically and allows them to easily see the tasks they have due and the tasks they already performed, insert grades into the system that will then be put into SRS by the head TA or professor, and state their availability. The system will automatically assign tasks fairly, prioritizing the TAs who have done the least work and automatically log the tasks done to the TA’s profile, it should also distribute students into different rooms for exam days. Different restrictions will be applied for the system to work properly and smoothly, such as only allowing PHD students to be assigned to MS/PHD level courses, not assigning anything to Tas on leave, not assigning TA work in a class they are taking, and not assigning anything to a TA who has a class/exam that hour. Restrictions COULD be broken as a last resort if the required number of TAs for a specific task is not found though, but will need to be manually overridden by the head of department or the dean.

---

## 3.3 Problems that Web Application Will Solve
- **Scheduling Conflicts & Overlaps:** TAs often get assigned duties that overlap with their own classes, or exams, causing missed tasks and last-minute scrambles. Proctoring duties can also clash with their exams, causing further stress and disruption.

- **Inefficient Manual Assignment Process:** Departments often manage TA assignments manually through emails and spreadsheets, making the process inefficient and prone to errors. Without automation, tracking and balancing workloads becomes challenging.

- **Unfair Workload Distribution:** Some TAs end up overloaded while others have barely any work, leading to frustration and unfairness. Without a proper tracking system, balancing workloads is a challenge.

- **Difficulties in Managing Leave Requests:** There’s no automated system to block assignments when TAs take leave for conferences, illness, or personal reasons, often leading to miscommunication and last-minute reassignments.

- **Challenges in Proctoring Assignments:** Manually assigning proctors is inefficient and often leads to last-minute availability issues. There’s also no structured system to ensure fair distribution while considering course-level restrictions.



---

## 3.4 Features That the Web Application Will Have

Our web application will offer various set of features that make it easy to manage TA tasks and proctoring assignments. Below are the main features:

### Centralized TA Duty Management
TAs can quickly submit the tasks they have completed (like lab sessions, grading, or office hours) under specific courses, along with the date, time, and duration. This data is then sent to the relevant course instructor for approval. Once approved, the system automatically updates each TA’s total workload, ensuring transparency and fairness in task distribution.

### Streamlined Leave of Absence Requests
When TAs need time off (for documented stuff like medical reasons, conferences, or vacations) they can enter the dates and upload relevant documents in the system. Department officials receive automatic notifications and can approve or reject these requests. Approved leaves instantly prevent any proctoring or duty assignments during the specified dates.

### Automated Proctor Assignments
The system prioritizes TAs with the least overall workload to ensure assignments are balanced. It respects multiple restrictions, such as assigning only PhD candidates to higher-level courses or blocking TAs who have conflicting exams. If the required number of TAs is still not reached, the system allows administrators to override these restrictions as a last resort.

### Manual Task Assignments
In addition to automated assignments, the application provides a manual assignment feature for authorized users. This comes in handy when certain tasks need specialized attention or if specific TAs are requested for a task. The system still flags any potential conflicts (exams, leaves, course enrollments etc.) so that administrators can make informed decisions.

### Easy Proctor Swaps
If a TA cannot fulfill an assigned proctoring duty, they can propose a swap with another TA. If both parties agree, the system sends officials a notification they could approve or reject. If it is approved, the system updates each TA’s workload and notifies all involved. Department staff can also initiate swaps, which the system carefully tracks to avoid repeated circular changes.

### Comprehensive Reporting and Logs
Every action—from logins to assignments and swaps—is logged for future reference. Then, the system can generate summary reports of total workloads, time spent per course, and any assignment changes. This ensures complete transparency and provides valuable insights for department chairs, deans, or administrative staff.

### Bulk Data Management
The system supports importing student, faculty, and course data via spreadsheet templates. This significantly reduces manual data entry and makes it easy to keep information current at the start of each semester.

---

## 3.5 Selling Points of Web Application
Reason why users should use this app:
- **Efficiency:** TA management is done automatically with algorithms based on the criteria and priorities, thus reducing administrative work and personnel load.//Should I mention about manual assignment  
- **Balanced Management:** It distributes tasks fairly by considering the priority, permission, and workload status of each TA within and between departments.  
- **Reporter:** At the end of the semester and year, the system helps the user by reporting system dynamics such as TA management, assignments, changes and permissions, and the TA workload resulting from the assignments.  
- **Inclusiveness:** The system is designed to manage a large number of TAs and their workload distribution in courses, thus managing a complete department.  
- **User-Friendly Interface:** The system provides trouble-free operations with simple and understandable interfaces for Admin, Dean, Department Chair, Department and Faculty Staff and TAs.

---

## 3.6 What Makes This Web Application Interesting and Cool

With the TA Management System, where TAs no longer have to stress about chaotic assignments, authorized users can assign tasks with just a few clicks, and fair and effective workload distribution which forms the basis of TA assignments, we find a fundamental solution to mail garbage and complex problems. 

There are many reasons to implement this system: It is smart, efficient, fair and eliminates headaches in assignments. It handles complicated tasks that authorities do not want to deal with, smoothly through the system. 

This system does not only manage assignments, but also reports like an assistant to the authorities, tracks TAs' actions and gives reports of their work. Its sleek and user-friendly design makes the management feel like an effortless experience. It provides comfort with a system that will make you question how assignments and management were carried out without this system before.

---
