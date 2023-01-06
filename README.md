# <b>Salesforce Productivity <span style="color: red;">Burst</span></b>
**Boost your productivity** on Salesforce with new VsCode commands.<br>
<code>(Contact me on [My Linkedin](https://www.linkedin.com/in/raffaele-preziosi-5835ba186/) for any ideas or suggestions)</code>
## Get Total Coverage and single methods test coverage of your Apex Classes/Triggers as in Salesforce Developer Console.

- **Instructions:**
  1. Run Apex test from VsCode
  2. Open Apex class to check and Run command "SPB: Get Coverage"
  3. Select the name test method and highlight covered/uncovered lines

* Change the colors of highlighted lines from vscode preferences to fit perfectly your vscode theme.

> *Tip: disable retrieve-test-code-coverage from settings to speed up your test.*

![Recording of Apex Get Coverage](https://github.com/PreziosiRaffaele/ApexGetCoverage/blob/main/demo.gif?raw=true)

## Quick opening metadata in SFDC from xml files.
- **Instructions:**
  1. Run the command SPB:Refresh Metadata (It will cache all the necessary data)
  2. Open a supported metadata in VSCode
  3. Click search icon in the status bar

> *Supported Metadata: flow, field, validation Rule, quickAction, flexi page, profile, permission set, permission set group, class, trigger, recordtype, layout*

![Recording of opening on Salesforce](https://raw.githubusercontent.com/PreziosiRaffaele/ApexGetCoverage/d8e63d0657931efd5bebc1967adf3679beb87cd0/OpenOnSalesForceDemo.gif)

## Quick activating of debug logging for your User, Automated Process, Integration Platform User.
- **Instructions:**
  1. Run command "SPB: Create Trace Flag"
  2. Select your user or Automated Process or Platform Integration User
  3. Select Debug Level
  4. The entity will be tracked during 1 hour (check in your status bar the expiration date)

> *Other commands: Disable Active trace flag, Delete all Apex Logs*

![Recording of opening on Salesforce](https://raw.githubusercontent.com/PreziosiRaffaele/ApexGetCoverage/main/createTraceFlagDemo.gif)
