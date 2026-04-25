#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  PrimalForge — brutalist mobile-first metabolic tracker (Expo) for biohackers / Hyrox / Crossfit /
  carnivore + animal-based athletes. 5-tab navigation (HUD · FUEL · FORGE · SCAN · VAULT), local-only
  AsyncStorage, Katch-McArdle baseline, British whole-foods DB, harmful-ingredient SCAN, XP/credits
  VAULT, recipes inside FUEL, burpee penalty for missed macros.

frontend:
  - task: "Refactor index.tsx (~1700 lines) into modular src/screens + src/components"
    implemented: true
    working: true
    file: "/app/frontend/app/index.tsx, /app/frontend/src/screens/*, /app/frontend/src/components/*, /app/frontend/src/types.ts, /app/frontend/src/utils.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Split monolith into Onboarding/HUDView/FuelView/ForgeView/ScanView/VaultView screens, Header/TabBar/WeightCheckIn components, types.ts and utils.ts. index.tsx now 438 lines (orchestrator only). Verified onboarding flow + tab nav via screenshot."

  - task: "SCAN tab — paste ingredient list, get Red/Amber/Green verdict"
    implemented: true
    working: true
    file: "/app/frontend/src/screens/ScanView.tsx, /app/frontend/src/data.ts (INGREDIENTS, scanLabel)"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Sample scan (drugstore lotion) flagged 7 RED, 2 AMBER, 2 CLEAN with verdict 0/AVOID. Save to history works. 80+ harmful ingredients in DB."

  - task: "Phase B Part 2 — RECIPES inside FUEL tab (25 curated whole-food recipes)"
    implemented: true
    working: true
    file: "/app/frontend/src/data.ts (RECIPES), /app/frontend/src/screens/FuelView.tsx, /app/frontend/src/styles.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Added FOODS|RECIPES segmented control inside FUEL. 25 recipes across BREAKFAST/LUNCH/DINNER/POST-WO/SNACK with macros, ingredients, step-by-step method and 'why it works' science note. One-tap LOG creates a serving entry in today's log + grants XP. Meal filter chips. Detail modal with full method. Verified visually."

metadata:
  created_by: "main_agent"
  version: "3.0"
  test_sequence: 5
  run_ui: false

test_plan:
  current_focus:
    - "Refactor index.tsx into modular structure"
    - "SCAN tab functionality"
    - "Recipes inside FUEL tab"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
      message: "Session 3 complete. Refactor done (index.tsx 1990 → 438 lines, 7 screens + 3 components + types + utils). SCAN tab verified working with verdict logic. RECIPES added — 25 ancestral/Hyrox-friendly meals inside FUEL tab with one-tap log. App is local-only (AsyncStorage), no auth, no backend test creds needed."