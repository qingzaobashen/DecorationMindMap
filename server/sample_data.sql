-- ������ڵ�
INSERT INTO nodes (node_id, name, parent_id, sort_order) VALUES (1, 'װ��������', NULL, 0);

-- ����һ���ӽڵ�
INSERT INTO nodes (node_id, name, parent_id, sort_order) VALUES
(2, '��ƽ׶�', 1, 1),
(3, 'ʩ���׶�', 1, 1);

-- ������ƽ׶��ӽڵ�
INSERT INTO nodes (node_id, name, parent_id, sort_order) VALUES
(4, '����ȷ��', 2, 2),
(5, '����ѡ��', 2, 2);

-- ����ʩ���׶��ӽڵ�
INSERT INTO nodes (node_id, name, parent_id, sort_order) VALUES
(6, '���ι���', 3, 2),
(7, '��ľ����', 3, 2);

-- ����ڵ���������
INSERT INTO node_details (parent_id, details, image) VALUES
(4, 'ȷ��װ�޷��','/resources/style1.png'),
(4, '�������', '/resources/test1.png'),
(5, 'ҵ������ͨ', '/resources/style1.png'),
(5, '�����嵥�ƶ�', '/resources/style1.png'),
(6, '��������淶', '/resources/style1.png'),
(7, '��ש����', '/resources/style1.png');