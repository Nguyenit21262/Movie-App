const useCommentTree = (setComments) => {
  const addToTree = (nodes, parentId, newNode) =>
    nodes.map((n) => {
      if (n._id === parentId) return { ...n, children: [newNode, ...(n.children ?? [])] };
      if (n.children) return { ...n, children: addToTree(n.children, parentId, newNode) };
      return n;
    });

  const editInTree = (nodes, id, content) =>
    nodes.map((n) => {
      if (n._id === id) return { ...n, content };
      if (n.children) return { ...n, children: editInTree(n.children, id, content) };
      return n;
    });

  const deleteFromTree = (nodes, id) =>
    nodes.filter((n) => n._id !== id).map((n) => ({
      ...n, children: n.children ? deleteFromTree(n.children, id) : []
    }));

  const countNodes = (nodes) =>
    nodes.reduce((sum, n) => sum + 1 + countNodes(n.children ?? []), 0);

  return {
    handleAdd: (pid, node) => setComments(prev => addToTree(prev, pid, node)),
    handleEdit: (id, txt) => setComments(prev => editInTree(prev, id, txt)),
    handleDelete: (id) => setComments(prev => deleteFromTree(prev, id)),
    total: countNodes
  };
};

export default useCommentTree;