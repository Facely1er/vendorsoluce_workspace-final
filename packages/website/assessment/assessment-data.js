export function getSections() {
  return [
    {
      id: "supplier",
      titleKey: "supplyChain.sections.supplier.title",
      descriptionKey: "supplyChain.sections.supplier.description",
      questions: [
        {
          id: "SR-1",
          questionKey: "supplyChain.sections.supplier.questions.sr1.question",
          control: "NIST SP 800-161 2.2.1",
          guidanceKey: "supplyChain.sections.supplier.questions.sr1.guidance"
        },
        {
          id: "SR-2",
          questionKey: "supplyChain.sections.supplier.questions.sr2.question",
          control: "NIST SP 800-161 2.2.5",
          guidanceKey: "supplyChain.sections.supplier.questions.sr2.guidance"
        },
        {
          id: "SR-3",
          questionKey: "supplyChain.sections.supplier.questions.sr3.question",
          control: "NIST SP 800-161 2.2.2",
          guidanceKey: "supplyChain.sections.supplier.questions.sr3.guidance"
        },
        {
          id: "SR-4",
          questionKey: "supplyChain.sections.supplier.questions.sr4.question",
          control: "NIST SP 800-161 2.2.6",
          guidanceKey: "supplyChain.sections.supplier.questions.sr4.guidance"
        }
      ]
    },
    {
      id: "threat",
      titleKey: "supplyChain.sections.threat.title",
      descriptionKey: "supplyChain.sections.threat.description",
      questions: [
        {
          id: "TM-1",
          questionKey: "supplyChain.sections.threat.questions.tm1.question",
          control: "NIST SP 800-161 2.3.1",
          guidanceKey: "supplyChain.sections.threat.questions.tm1.guidance"
        },
        {
          id: "TM-2",
          questionKey: "supplyChain.sections.threat.questions.tm2.question",
          control: "NIST SP 800-161 3.4.1",
          guidanceKey: "supplyChain.sections.threat.questions.tm2.guidance"
        },
        {
          id: "TM-3",
          questionKey: "supplyChain.sections.threat.questions.tm3.question",
          control: "NIST SP 800-161 2.2.14",
          guidanceKey: "supplyChain.sections.threat.questions.tm3.guidance"
        },
        {
          id: "TM-4",
          questionKey: "supplyChain.sections.threat.questions.tm4.question",
          control: "NIST SP 800-161 3.3.1",
          guidanceKey: "supplyChain.sections.threat.questions.tm4.guidance"
        }
      ]
    },
    {
      id: "vulnerability",
      titleKey: "supplyChain.sections.vulnerability.title",
      descriptionKey: "supplyChain.sections.vulnerability.description",
      questions: [
        {
          id: "VM-1",
          questionKey: "supplyChain.sections.vulnerability.questions.vm1.question",
          control: "NIST SP 800-161 3.4.2",
          guidanceKey: "supplyChain.sections.vulnerability.questions.vm1.guidance"
        },
        {
          id: "VM-2",
          questionKey: "supplyChain.sections.vulnerability.questions.vm2.question",
          control: "NIST SP 800-161 2.7.1",
          guidanceKey: "supplyChain.sections.vulnerability.questions.vm2.guidance"
        },
        {
          id: "VM-3",
          questionKey: "supplyChain.sections.vulnerability.questions.vm3.question",
          control: "NIST SP 800-161 2.7.3",
          guidanceKey: "supplyChain.sections.vulnerability.questions.vm3.guidance"
        },
        {
          id: "VM-4",
          questionKey: "supplyChain.sections.vulnerability.questions.vm4.question",
          control: "NIST SP 800-161 3.6.2",
          guidanceKey: "supplyChain.sections.vulnerability.questions.vm4.guidance"
        }
      ]
    },
    {
      id: "information",
      titleKey: "supplyChain.sections.information.title",
      descriptionKey: "supplyChain.sections.information.description",
      questions: [
        {
          id: "IS-1",
          questionKey: "supplyChain.sections.information.questions.is1.question",
          control: "NIST SP 800-161 3.8.1",
          guidanceKey: "supplyChain.sections.information.questions.is1.guidance"
        },
        {
          id: "IS-2",
          questionKey: "supplyChain.sections.information.questions.is2.question",
          control: "NIST SP 800-161 3.8.3",
          guidanceKey: "supplyChain.sections.information.questions.is2.guidance"
        },
        {
          id: "IS-3",
          questionKey: "supplyChain.sections.information.questions.is3.question",
          control: "NIST SP 800-161 3.8.5",
          guidanceKey: "supplyChain.sections.information.questions.is3.guidance"
        },
        {
          id: "IS-4",
          questionKey: "supplyChain.sections.information.questions.is4.question",
          control: "NIST SP 800-161 3.8.6",
          guidanceKey: "supplyChain.sections.information.questions.is4.guidance"
        }
      ]
    },
    {
      id: "incident",
      titleKey: "supplyChain.sections.incident.title",
      descriptionKey: "supplyChain.sections.incident.description",
      questions: [
        {
          id: "IR-1",
          questionKey: "supplyChain.sections.incident.questions.ir1.question",
          control: "NIST SP 800-161 2.8.4",
          guidanceKey: "supplyChain.sections.incident.questions.ir1.guidance"
        },
        {
          id: "IR-2",
          questionKey: "supplyChain.sections.incident.questions.ir2.question",
          control: "NIST SP 800-161 2.8.5",
          guidanceKey: "supplyChain.sections.incident.questions.ir2.guidance"
        },
        {
          id: "IR-3",
          questionKey: "supplyChain.sections.incident.questions.ir3.question",
          control: "NIST SP 800-161 2.8.8",
          guidanceKey: "supplyChain.sections.incident.questions.ir3.guidance"
        },
        {
          id: "IR-4",
          questionKey: "supplyChain.sections.incident.questions.ir4.question",
          control: "NIST SP 800-161 2.8.9",
          guidanceKey: "supplyChain.sections.incident.questions.ir4.guidance"
        }
      ]
    },
    {
      id: "lifecycle",
      titleKey: "supplyChain.sections.lifecycle.title",
      descriptionKey: "supplyChain.sections.lifecycle.description",
      questions: [
        {
          id: "SL-1",
          questionKey: "supplyChain.sections.lifecycle.questions.sl1.question",
          control: "NIST SP 800-161 2.2.16",
          guidanceKey: "supplyChain.sections.lifecycle.questions.sl1.guidance"
        },
        {
          id: "SL-2",
          questionKey: "supplyChain.sections.lifecycle.questions.sl2.question",
          control: "NIST SP 800-161 2.2.17",
          guidanceKey: "supplyChain.sections.lifecycle.questions.sl2.guidance"
        },
        {
          id: "SL-3",
          questionKey: "supplyChain.sections.lifecycle.questions.sl3.question",
          control: "NIST SP 800-161 2.6.3",
          guidanceKey: "supplyChain.sections.lifecycle.questions.sl3.guidance"
        },
        {
          id: "SL-4",
          questionKey: "supplyChain.sections.lifecycle.questions.sl4.question",
          control: "NIST SP 800-161 2.6.4",
          guidanceKey: "supplyChain.sections.lifecycle.questions.sl4.guidance"
        }
      ]
    }
  ];
}
