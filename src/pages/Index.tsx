import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'client' | 'cashier' | 'admin' | 'creator' | 'nikitovsky' | null;
type Section = 'dashboard' | 'storage' | 'archive' | 'forms';

type Item = {
  id: string;
  qrCode: string;
  itemName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  department: 'documents' | 'photos' | 'cards' | 'other';
  depositAmount: number;
  pickupAmount: number;
  depositDate: string;
  pickupDate: string;
  status: 'stored' | 'picked_up' | 'archived';
  createdBy: string;
  archivedDate?: string;
};

const DEPARTMENT_LIMITS = {
  documents: 100,
  photos: 100,
  cards: 100,
  other: Infinity,
};

const STORAGE_KEY = 'storage_items';

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);

  const [newItem, setNewItem] = useState({
    itemName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    department: 'documents' as Item['department'],
    depositAmount: 0,
    pickupAmount: 0,
    depositDate: '',
    pickupDate: '',
  });

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      }
    }
  }, []);

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleLogin = (role: UserRole) => {
    if (role === 'client') {
      if (username.trim() === '' || password.trim() !== '') {
        toast.error('Клиент: введите только номер телефона, пароль оставьте пустым');
        return;
      }
      setCurrentRole('client');
      toast.success('Вход выполнен как клиент');
    } else if (role === 'cashier') {
      if (password === '25') {
        setCurrentRole('cashier');
        toast.success('Вход выполнен как кассир');
      } else {
        toast.error('Неверный пароль кассира');
      }
    } else if (role === 'admin') {
      if (password === '2025') {
        setCurrentRole('admin');
        toast.success('Вход выполнен как администратор');
      } else {
        toast.error('Неверный пароль администратора');
      }
    } else if (role === 'creator') {
      if (password === '202505') {
        setCurrentRole('creator');
        toast.success('Вход выполнен как создатель');
      } else {
        toast.error('Неверный пароль создателя');
      }
    } else if (role === 'nikitovsky') {
      if (password === '20252025') {
        setCurrentRole('nikitovsky');
        toast.success('Вход выполнен как Никитовский');
      } else {
        toast.error('Неверный пароль');
      }
    }
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setUsername('');
    setPassword('');
    setCurrentSection('dashboard');
    toast.info('Вы вышли из системы');
  };

  const generateQRCode = () => {
    return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getDepartmentCount = (dept: Item['department']) => {
    return items.filter((item) => item.department === dept && item.status === 'stored').length;
  };

  const handleAddItem = () => {
    const count = getDepartmentCount(newItem.department);
    const limit = DEPARTMENT_LIMITS[newItem.department];

    if (count >= limit) {
      toast.error(`Отдел "${newItem.department}" заполнен (лимит ${limit} предметов)`);
      return;
    }

    const item: Item = {
      id: `item-${Date.now()}`,
      qrCode: generateQRCode(),
      ...newItem,
      status: 'stored',
      createdBy: username || 'admin',
    };

    setItems([...items, item]);
    toast.success(`Предмет добавлен! QR: ${item.qrCode}`);
    
    setNewItem({
      itemName: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      department: 'documents',
      depositAmount: 0,
      pickupAmount: 0,
      depositDate: '',
      pickupDate: '',
    });
    setShowItemForm(false);
  };

  const handlePickupItem = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, status: 'picked_up' as const } : item
      )
    );
    toast.success('Предмет выдан клиенту');
  };

  const handleArchiveItem = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'archived' as const,
              archivedDate: new Date().toISOString(),
            }
          : item
      )
    );
    toast.success('Предмет перемещён в постоянный архив');
  };

  const printForm = (filled: boolean) => {
    window.print();
    toast.info(filled ? 'Печать заполненной анкеты' : 'Печать пустой анкеты');
  };

  if (!currentRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-primary" />
            <CardTitle className="text-3xl">Система хранения</CardTitle>
            <CardDescription>Выберите роль для входа в систему</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client">Клиент</TabsTrigger>
                <TabsTrigger value="staff">Персонал</TabsTrigger>
              </TabsList>
              
              <TabsContent value="client" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Номер телефона</Label>
                  <Input
                    id="client-phone"
                    placeholder="+7 (___) ___-__-__"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Пароль оставьте пустым</p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleLogin('client')}
                >
                  <Icon name="User" className="mr-2" size={16} />
                  Войти как клиент
                </Button>
              </TabsContent>
              
              <TabsContent value="staff" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Имя пользователя</Label>
                  <Input
                    id="staff-name"
                    placeholder="Введите имя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Пароль</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleLogin('cashier')}
                    className="w-full"
                  >
                    <Icon name="Wallet" className="mr-2" size={16} />
                    Кассир
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLogin('admin')}
                    className="w-full"
                  >
                    <Icon name="Shield" className="mr-2" size={16} />
                    Админ
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleLogin('creator')}
                    className="w-full"
                  >
                    <Icon name="Crown" className="mr-2" size={16} />
                    Создатель
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLogin('nikitovsky')}
                    className="w-full"
                  >
                    <Icon name="Sparkles" className="mr-2" size={16} />
                    Никитовский
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientItems = items.filter((item) => item.phone === username);
  const storedItems = items.filter((item) => item.status === 'stored');
  const pickedUpItems = items.filter((item) => item.status === 'picked_up');
  const archivedItems = items.filter((item) => item.status === 'archived');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Package" size={32} className="text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Система хранения</h1>
              <p className="text-sm text-gray-500">
                {currentRole === 'client' && 'Личный кабинет клиента'}
                {currentRole === 'cashier' && 'Режим кассира'}
                {currentRole === 'admin' && 'Панель администратора'}
                {currentRole === 'creator' && 'Панель создателя'}
                {currentRole === 'nikitovsky' && 'Панель Никитовского'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="mr-2" size={16} />
            Выйти
          </Button>
        </div>
      </header>

      {currentRole !== 'client' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-1">
              <Button
                variant={currentSection === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentSection('dashboard')}
                className="rounded-none"
              >
                <Icon name="LayoutDashboard" className="mr-2" size={16} />
                Главная
              </Button>
              <Button
                variant={currentSection === 'storage' ? 'default' : 'ghost'}
                onClick={() => setCurrentSection('storage')}
                className="rounded-none"
              >
                <Icon name="Package" className="mr-2" size={16} />
                На хранении
              </Button>
              <Button
                variant={currentSection === 'archive' ? 'default' : 'ghost'}
                onClick={() => setCurrentSection('archive')}
                className="rounded-none"
              >
                <Icon name="Archive" className="mr-2" size={16} />
                Архив
              </Button>
              {(currentRole === 'admin' || currentRole === 'creator' || currentRole === 'nikitovsky') && (
                <Button
                  variant={currentSection === 'forms' ? 'default' : 'ghost'}
                  onClick={() => setCurrentSection('forms')}
                  className="rounded-none"
                >
                  <Icon name="Printer" className="mr-2" size={16} />
                  Печать анкет
                </Button>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="container mx-auto px-4 py-8">
        {currentRole === 'client' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои предметы</CardTitle>
                <CardDescription>
                  Всего предметов на хранении: {clientItems.filter(i => i.status === 'stored').length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>У вас пока нет предметов на хранении</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {clientItems.map((item) => (
                      <Card key={item.id} className="bg-gray-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">{item.itemName}</h3>
                              <p className="text-sm text-muted-foreground">
                                QR: {item.qrCode}
                              </p>
                              <p className="text-sm">
                                Отдел: <span className="font-medium">{item.department}</span>
                              </p>
                              <p className="text-sm">
                                Статус:{' '}
                                <span
                                  className={`font-medium ${
                                    item.status === 'stored'
                                      ? 'text-green-600'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {item.status === 'stored' ? 'На хранении' : 'Выдан'}
                                </span>
                              </p>
                            </div>
                            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white border-2 border-gray-300">
                              <Icon name="QrCode" size={64} className="text-primary" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentRole !== 'client' && currentSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Документы</p>
                      <p className="text-2xl font-bold">
                        {getDepartmentCount('documents')}/{DEPARTMENT_LIMITS.documents}
                      </p>
                    </div>
                    <Icon name="FileText" size={32} className="text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Фото</p>
                      <p className="text-2xl font-bold">
                        {getDepartmentCount('photos')}/{DEPARTMENT_LIMITS.photos}
                      </p>
                    </div>
                    <Icon name="Image" size={32} className="text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Карты</p>
                      <p className="text-2xl font-bold">
                        {getDepartmentCount('cards')}/{DEPARTMENT_LIMITS.cards}
                      </p>
                    </div>
                    <Icon name="CreditCard" size={32} className="text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Другое</p>
                      <p className="text-2xl font-bold">{getDepartmentCount('other')}</p>
                    </div>
                    <Icon name="Package" size={32} className="text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {(currentRole === 'admin' || currentRole === 'creator' || currentRole === 'nikitovsky') && (
              <Card>
                <CardHeader>
                  <CardTitle>Управление</CardTitle>
                  <CardDescription>Добавление новых предметов</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showItemForm ? (
                    <Button onClick={() => setShowItemForm(true)} className="w-full">
                      <Icon name="Plus" className="mr-2" size={16} />
                      Добавить предмет
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Название предмета</Label>
                          <Input
                            value={newItem.itemName}
                            onChange={(e) =>
                              setNewItem({ ...newItem, itemName: e.target.value })
                            }
                            placeholder="Паспорт, фото и т.д."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Отдел</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={newItem.department}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                department: e.target.value as Item['department'],
                              })
                            }
                          >
                            <option value="documents">Документы</option>
                            <option value="photos">Фото</option>
                            <option value="cards">Карты</option>
                            <option value="other">Другое</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Имя</Label>
                          <Input
                            value={newItem.firstName}
                            onChange={(e) =>
                              setNewItem({ ...newItem, firstName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Фамилия</Label>
                          <Input
                            value={newItem.lastName}
                            onChange={(e) =>
                              setNewItem({ ...newItem, lastName: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Телефон</Label>
                          <Input
                            value={newItem.phone}
                            onChange={(e) =>
                              setNewItem({ ...newItem, phone: e.target.value })
                            }
                            placeholder="+7 (___) ___-__-__"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email (если есть)</Label>
                          <Input
                            value={newItem.email}
                            onChange={(e) =>
                              setNewItem({ ...newItem, email: e.target.value })
                            }
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Сумма при сдаче</Label>
                          <Input
                            type="number"
                            value={newItem.depositAmount}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                depositAmount: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Сумма при выдаче</Label>
                          <Input
                            type="number"
                            value={newItem.pickupAmount}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                pickupAmount: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Дата сдачи</Label>
                          <Input
                            type="date"
                            value={newItem.depositDate}
                            onChange={(e) =>
                              setNewItem({ ...newItem, depositDate: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Дата выдачи</Label>
                          <Input
                            type="date"
                            value={newItem.pickupDate}
                            onChange={(e) =>
                              setNewItem({ ...newItem, pickupDate: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleAddItem} className="flex-1">
                          <Icon name="Save" className="mr-2" size={16} />
                          Сохранить
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowItemForm(false)}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentRole !== 'client' && currentSection === 'storage' && (
          <Card>
            <CardHeader>
              <CardTitle>Предметы на хранении</CardTitle>
              <CardDescription>
                Всего на хранении: {storedItems.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storedItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет предметов на хранении</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.itemName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.firstName} {item.lastName} • {item.phone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          QR: {item.qrCode} • {item.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          На хранении
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handlePickupItem(item.id)}
                        >
                          <Icon name="CheckCircle" className="mr-1" size={14} />
                          Выдать
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentRole !== 'client' && currentSection === 'archive' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Выданные предметы</CardTitle>
                <CardDescription>
                  Временный архив выданных предметов: {pickedUpItems.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pickedUpItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет выданных предметов</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pickedUpItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.itemName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.firstName} {item.lastName} • {item.phone}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            QR: {item.qrCode} • {item.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            Выдан
                          </span>
                          {(currentRole === 'admin' || currentRole === 'creator' || currentRole === 'nikitovsky') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleArchiveItem(item.id)}
                            >
                              <Icon name="Archive" className="mr-1" size={14} />
                              В архив
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Постоянный архив</CardTitle>
                <CardDescription>
                  Все документы, которые хранятся вечно: {archivedItems.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {archivedItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Archive" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Постоянный архив пуст</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archivedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.itemName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.firstName} {item.lastName} • {item.phone}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            QR: {item.qrCode} • {item.department}
                          </p>
                          {item.archivedDate && (
                            <p className="text-xs text-blue-600 mt-1">
                              Архивирован: {new Date(item.archivedDate).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          В архиве навсегда
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentRole !== 'client' && currentSection === 'forms' && (
          <Card>
            <CardHeader>
              <CardTitle>Печать анкет</CardTitle>
              <CardDescription>Печать форм для документооборота</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => printForm(false)}>
                  <Icon name="Printer" className="mr-2" size={16} />
                  Пустая анкета
                </Button>
                <Button variant="outline" onClick={() => printForm(true)}>
                  <Icon name="Printer" className="mr-2" size={16} />
                  Заполненная анкета
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;