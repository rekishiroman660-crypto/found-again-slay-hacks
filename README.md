# Found Again

An offline lost-property matching desk. Open index.html in a current browser. All content is local to the tab. The six starter records are fictional. Staff can replace the inventory and see which normalized clues contributed to each result.

The model fits inverse document frequencies to the current inventory, then computes cosine similarity between the weighted query and each record. The optional normalization vocabulary handles a few common English terms. A zero-overlap query returns no candidate. The system does not establish ownership and does not handle semantic paraphrases beyond its small dictionary.
